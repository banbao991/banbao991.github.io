#include <mitsuba/render/scene.h>

// 命名空间 mitsuba
MTS_NAMESPACE_BEGIN

// MTS_DECLARE_CLASS, MTS_IMPLEMENT_CLASS
// 这两项保证被识别为一个 mitsuba 的类, 可以获得 mitsuba 内部的一些配置
// 引用计数、序列化和反序列化、运行时的错误类型信息等

class DepthViewer : public SamplingIntegrator {
   public:
    MTS_DECLARE_CLASS();

    // 从参数中初始化(XML 文件)
    DepthViewer(const Properties& props) : SamplingIntegrator(props) {
        Spectrum defaultColor;
        defaultColor.fromLinearRGB(0.2f, 0.5f, 0.2f);
        // 如果设定了颜色的话则为指定颜色, 否则为默认颜色(绿色)
        m_color = props.getSpectrum("color", defaultColor);
    }

    // 序列化、反序列化的支持(注意也要将基类序列化)
    void serialize(Stream* stream, InstanceManager* manager) const {
        SamplingIntegrator::serialize(stream, manager);
        // Spectrum 本身已经实现了序列化的接口
        // 如果是一些简单的数字, 我们可以使用 Stream 的功能
        // 默认完成了字节序的转化(不需要考虑大端小端)
        // Ex: writeShort(), readShort()
        m_color.serialize(stream);
        stream->writeFloat(m_maxDist);
    }
    DepthViewer(Stream* stream, InstanceManager* manager)
        : SamplingIntegrator(stream, manager) {
        m_color = Spectrum(stream);
        m_maxDist = stream->readFloat();
    }

    // 实现对一条光线的 radiance 估计
    virtual Spectrum Li(const RayDifferential& r,
                        RadianceQueryRecord& rRec) const override {
        // 深度映射到 [0,1]

        // 允许 integrator 嵌套, 可以通过 rRec 传递击中的点
        // 避免多次计算导致的浪费
        // rRec.rayIntersect(r) 如果保存了点, 则直接返回, 否则会计算
        if (rRec.rayIntersect(r)) {
            Float distance = rRec.its.t;
            return Spectrum(1.0f - distance / m_maxDist) * m_color;
        }
        return Spectrum(0.0f);
    }

    // 在并行计算之前就已经完成, 任何被更新的东西都会在之后会发送到所有并行节点
    virtual bool preprocess(const Scene* scene, RenderQueue* queue,
                            const RenderJob* job, int sceneResID,
                            int sensorResID, int samplerResID) override {
        // 预计算最远的距离 m_maxDist
        m_maxDist = -std::numeric_limits<Float>::infinity();

        // 遍历场景包围盒的每一个顶点, 计算相机到他们的最大距离
        const AABB& sceneAABB = scene->getAABB();
        Point cameraPosition =
            scene->getSensor()->getWorldTransform()->eval(0).transformAffine(
                Point(0.0f));

        for (int i = 0; i < 8; ++i) {
            m_maxDist = std::max(
                m_maxDist, (cameraPosition - sceneAABB.getCorner(i)).length());
        }
        return true;
    }

   private:
    Spectrum m_color;
    // 最远的距离, 映射成为 1
    Float m_maxDist;
};

// S 表示该类是可序列化的(网络传输)
// (当前类, 是否为抽象类, 基类)
MTS_IMPLEMENT_CLASS_S(DepthViewer, false, SamplingIntegrator);

// 导出为一个插件
MTS_EXPORT_PLUGIN(DepthViewer, "A depth map viewer");

// 命名空间 mitsuba
MTS_NAMESPACE_END