"use strict";

(function () {
    const ASSET_ROOT = "assets/bmw/";
    const SKELETON_PATH = ASSET_ROOT + "spine.json";
    const ATLAS_PATH = ASSET_ROOT + "spine.atlas";
    const MAX_DEVICE_PIXEL_RATIO = 2;
    const VIEW_PADDING = 1.06;
    // These textures need premultiplication before GPU filtering. Keeping an
    // opt-out query makes it easy to compare the original straight-alpha path
    // when diagnosing a new asset: ?alpha=straight
    const PREMULTIPLIED_ALPHA =
        new URLSearchParams(window.location.search).get("alpha") !== "straight";

    const animationInfo = {
        idle: {label: "待机", loop: true},
        greeting: {label: "问候", loop: false, next: "idle"},
        click: {label: "互动", loop: false, next: "idle"},
        celebrate: {label: "庆祝", loop: false, next: "celebrate_idle"},
        celebrate_idle: {label: "庆祝待机", loop: true}
    };

    const ui = {
        canvas: document.getElementById("canvas"),
        runtimeStatus: document.getElementById("runtimeStatus"),
        statusText: document.getElementById("statusText"),
        loadingOverlay: document.getElementById("loadingOverlay"),
        loadingDetail: document.getElementById("loadingDetail"),
        errorOverlay: document.getElementById("errorOverlay"),
        errorMessage: document.getElementById("errorMessage"),
        reloadButton: document.getElementById("reloadButton"),
        stageHint: document.getElementById("stageHint"),
        animationLabel: document.getElementById("animationLabel"),
        togglePlayback: document.getElementById("togglePlayback"),
        playbackLabel: document.getElementById("playbackLabel"),
        animationButtons: Array.from(document.querySelectorAll("[data-animation]"))
    };

    const app = {
        ready: false,
        failed: false,
        paused: false,
        currentAnimation: null,
        gl: null,
        shader: null,
        batcher: null,
        renderer: null,
        assetManager: null,
        skeleton: null,
        state: null,
        bounds: null,
        mvp: null,
        lastFrameTime: 0,
        frameRequest: 0,
        resizeObserver: null
    };

    function setStatus(text, stateClass) {
        ui.statusText.textContent = text;
        ui.runtimeStatus.classList.remove("ready", "error");
        if (stateClass) ui.runtimeStatus.classList.add(stateClass);
    }

    function setControlsEnabled(enabled) {
        ui.animationButtons.forEach(function (button) {
            button.disabled = !enabled;
        });
        ui.togglePlayback.disabled = !enabled;
    }

    function showError(message, error) {
        if (app.failed) return;
        app.failed = true;
        app.ready = false;
        setControlsEnabled(false);
        setStatus("加载失败", "error");
        ui.loadingOverlay.hidden = true;
        ui.stageHint.hidden = true;
        ui.errorMessage.textContent = message;
        ui.errorOverlay.hidden = false;
        if (error) console.error(message, error);
    }

    function configureTransparentCanvasBlending(batcher, gl) {
        // The asset's additive particles are stored on opaque black texels.
        // Spine's stock batcher applies the RGB factors to alpha as well, which
        // makes those texels reveal black rectangles on a transparent canvas.
        // Preserve destination alpha for additive light, and use source-over
        // alpha for the other modes while leaving their RGB formulas intact.
        batcher.setBlendMode = function (srcBlend, dstBlend) {
            this.srcBlend = srcBlend;
            this.dstBlend = dstBlend;
            if (!this.isDrawing) return;

            this.flush();
            if (dstBlend === gl.ONE) {
                gl.blendFuncSeparate(srcBlend, dstBlend, gl.ZERO, gl.ONE);
            } else {
                gl.blendFuncSeparate(
                    srcBlend,
                    dstBlend,
                    gl.ONE,
                    gl.ONE_MINUS_SRC_ALPHA
                );
            }
        };
    }

    function setupWebGL() {
        const contextOptions = {
            alpha: true,
            antialias: true,
            premultipliedAlpha: PREMULTIPLIED_ALPHA,
            preserveDrawingBuffer: false
        };

        const gl = ui.canvas.getContext("webgl", contextOptions) ||
            ui.canvas.getContext("experimental-webgl", contextOptions);

        if (!gl) {
            throw new Error("当前浏览器或设备未提供 WebGL 1 支持。");
        }

        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        // Spine 3.8's GLTexture honors the current unpack state. Premultiplying
        // before texture filtering prevents bright/dark rings where separate
        // feathered attachments overlap (notably the knees and eyes).
        spine.webgl.GLTexture.DISABLE_UNPACK_PREMULTIPLIED_ALPHA_WEBGL =
            !PREMULTIPLIED_ALPHA;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, PREMULTIPLIED_ALPHA);
        app.gl = gl;
        app.mvp = new spine.webgl.Matrix4();
        app.shader = spine.webgl.Shader.newTwoColoredTextured(gl);
        app.batcher = new spine.webgl.PolygonBatcher(gl, true);
        configureTransparentCanvasBlending(app.batcher, gl);
        app.renderer = new spine.webgl.SkeletonRenderer(gl, true);
        app.renderer.premultipliedAlpha = PREMULTIPLIED_ALPHA;
        app.assetManager = new spine.webgl.AssetManager(gl);
    }

    function beginAssetLoad() {
        app.assetManager.loadText(SKELETON_PATH);
        app.assetManager.loadTextureAtlas(ATLAS_PATH);
        requestAnimationFrame(waitForAssets);
    }

    function waitForAssets() {
        if (app.failed) return;

        if (app.assetManager.hasErrors()) {
            const errors = app.assetManager.getErrors();
            const details = Object.keys(errors).map(function (path) {
                return path + ": " + errors[path];
            }).join("；");
            showError("资源加载失败：" + details, errors);
            return;
        }

        if (!app.assetManager.isLoadingComplete()) {
            const loaded = app.assetManager.getLoaded();
            const remaining = app.assetManager.getToLoad();
            ui.loadingDetail.textContent = "已完成 " + loaded + " 项，还有 " + remaining + " 项…";
            requestAnimationFrame(waitForAssets);
            return;
        }

        try {
            buildSkeleton();
        } catch (error) {
            showError("骨骼数据解析失败：" + error.message, error);
        }
    }

    function buildSkeleton() {
        const atlas = app.assetManager.get(ATLAS_PATH);
        const jsonText = app.assetManager.get(SKELETON_PATH);
        if (!atlas || !jsonText) throw new Error("Atlas 或 JSON 未进入资源缓存。");

        const attachmentLoader = new spine.AtlasAttachmentLoader(atlas);
        const skeletonJson = new spine.SkeletonJson(attachmentLoader);
        skeletonJson.scale = 1;

        const skeletonData = skeletonJson.readSkeletonData(jsonText);
        const skeleton = new spine.Skeleton(skeletonData);
        if (skeletonData.findSkin("default")) skeleton.setSkinByName("default");
        skeleton.setToSetupPose();

        const stateData = new spine.AnimationStateData(skeletonData);
        stateData.defaultMix = 0;
        const state = new spine.AnimationState(stateData);
        state.addListener({
            start: function (entry) {
                if (entry.trackIndex === 0) setActiveAnimation(entry.animation.name);
            }
        });

        app.skeleton = skeleton;
        app.state = state;
        app.bounds = createBounds(skeletonData, skeleton);

        // Apply the first animation before the first draw. This prevents the setup
        // pose clipping attachment and setup-only effects from flashing on screen.
        queueAnimation("greeting");
        state.update(0);
        state.apply(skeleton);
        skeleton.updateWorldTransform();

        app.ready = true;
        app.lastFrameTime = performance.now();
        setControlsEnabled(true);
        setStatus("运行中", "ready");
        ui.loadingOverlay.hidden = true;
        ui.stageHint.hidden = false;
        installResizeHandler();
        scheduleRender();
    }

    function createBounds(skeletonData, skeleton) {
        if (skeletonData.width > 0 && skeletonData.height > 0) {
            return {
                x: skeletonData.x,
                y: skeletonData.y,
                width: skeletonData.width,
                height: skeletonData.height
            };
        }

        skeleton.updateWorldTransform();
        const offset = new spine.Vector2();
        const size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        return {x: offset.x, y: offset.y, width: size.x, height: size.y};
    }

    function queueAnimation(name) {
        const info = animationInfo[name];
        if (!info) throw new Error("未知动画：" + name);

        app.state.setAnimation(0, name, info.loop);
        if (!info.loop && info.next) {
            app.state.addAnimation(0, info.next, true, 0);
        }
    }

    function playAnimation(name) {
        if (!app.ready || app.failed) return;
        if (app.paused) setPaused(false);
        queueAnimation(name);
        app.lastFrameTime = performance.now();
        scheduleRender();
    }

    function setActiveAnimation(name) {
        app.currentAnimation = name;
        const info = animationInfo[name];
        ui.animationLabel.textContent = "当前动作：" + (info ? info.label : name);
        ui.animationButtons.forEach(function (button) {
            const buttonAnimation = button.dataset.animation;
            const isIdleAlias = name === "celebrate_idle" && buttonAnimation === "idle";
            button.classList.toggle("active", buttonAnimation === name || isIdleAlias);
            button.setAttribute("aria-pressed", buttonAnimation === name || isIdleAlias ? "true" : "false");
        });
    }

    function setPaused(paused) {
        if (!app.ready) return;
        app.paused = paused;
        ui.playbackLabel.textContent = paused ? "继续" : "暂停";
        ui.togglePlayback.querySelector(".pause-icon").textContent = paused ? "▶" : "Ⅱ";
        setStatus(paused ? "已暂停" : "运行中", "ready");
        if (!paused) {
            app.lastFrameTime = performance.now();
            scheduleRender();
        }
    }

    function scheduleRender() {
        if (!app.ready || app.failed || app.frameRequest) return;
        app.frameRequest = requestAnimationFrame(render);
    }

    function resizeCanvas() {
        const rect = ui.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));

        if (ui.canvas.width !== width || ui.canvas.height !== height) {
            ui.canvas.width = width;
            ui.canvas.height = height;
        }

        const bounds = app.bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const contentWidth = bounds.width * VIEW_PADDING;
        const contentHeight = bounds.height * VIEW_PADDING;
        const canvasAspect = width / height;
        const contentAspect = contentWidth / contentHeight;

        let viewWidth;
        let viewHeight;
        if (contentAspect > canvasAspect) {
            viewWidth = contentWidth;
            viewHeight = viewWidth / canvasAspect;
        } else {
            viewHeight = contentHeight;
            viewWidth = viewHeight * canvasAspect;
        }

        app.mvp.ortho2d(centerX - viewWidth / 2, centerY - viewHeight / 2, viewWidth, viewHeight);
        app.gl.viewport(0, 0, width, height);
    }

    function render(now) {
        app.frameRequest = 0;
        if (!app.ready || app.failed) return;

        const delta = Math.min(Math.max((now - app.lastFrameTime) / 1000, 0), 1 / 15);
        app.lastFrameTime = now;

        if (!app.paused) {
            app.state.update(delta);
            app.state.apply(app.skeleton);
            app.skeleton.updateWorldTransform();
        }

        resizeCanvas();
        const gl = app.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        app.shader.bind();
        app.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
        app.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, app.mvp.values);
        app.batcher.begin(app.shader);
        app.renderer.draw(app.batcher, app.skeleton);
        app.batcher.end();
        app.shader.unbind();

        if (!app.paused) scheduleRender();
    }

    function installResizeHandler() {
        if ("ResizeObserver" in window) {
            app.resizeObserver = new ResizeObserver(scheduleRender);
            app.resizeObserver.observe(ui.canvas);
        } else {
            window.addEventListener("resize", scheduleRender);
        }
    }

    function bindControls() {
        ui.animationButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                playAnimation(button.dataset.animation);
            });
        });

        ui.togglePlayback.addEventListener("click", function () {
            setPaused(!app.paused);
        });

        ui.canvas.addEventListener("click", function () {
            playAnimation("click");
        });

        ui.canvas.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                playAnimation("click");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const shortcuts = {"1": "greeting", "2": "click", "3": "celebrate", "4": "idle"};
            if (shortcuts[event.key]) playAnimation(shortcuts[event.key]);
        });

        document.addEventListener("visibilitychange", function () {
            app.lastFrameTime = performance.now();
            if (!document.hidden && !app.paused) scheduleRender();
        });

        ui.reloadButton.addEventListener("click", function () {
            window.location.reload();
        });

        ui.canvas.addEventListener("webglcontextlost", function (event) {
            event.preventDefault();
            showError("WebGL 上下文已丢失，请重新加载页面。");
        });
    }

    function init() {
        setControlsEnabled(false);
        bindControls();

        if (!window.spine || !spine.webgl) {
            showError("Spine 3.8 WebGL 运行时没有成功加载。");
            return;
        }

        try {
            setupWebGL();
            beginAssetLoad();
        } catch (error) {
            showError(error.message, error);
        }
    }

    init();
}());
