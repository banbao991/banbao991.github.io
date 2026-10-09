'use strict';
// Canvas context, pixel primitives and ambient animation helpers, shared by all painters.
const canvas = document.getElementById('farm-map');
let ctx = canvas.getContext('2d', { alpha: false });

let W = 1152, H = 816;

const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); ctx.fill(); };

// Adjacent ground pixels must share a fill path. Separate fillRect calls leave
// translucent grid lines when the camera scales or translates by fractions.
function groundTilePainter() {
  const groups=new Map();
  return {
    add(x,y,w,h,color){
      if(!groups.has(color))groups.set(color,[]);
      groups.get(color).push([Math.round(x),Math.round(y),Math.round(w),Math.round(h)]);
    },
    draw(){
      const transform=ctx.getTransform?.();
      const align=transform&&transform.b===0&&transform.c===0&&transform.a>0&&transform.d>0;
      const edge=(value,scale,offset)=>(Math.round(value*scale+offset)-offset)/scale;
      for(const [color,tiles]of groups){
        ctx.beginPath();for(const [x,y,w,h]of tiles){
          if(align){
            // Different colors and opacity bands must meet at the same device
            // pixel too; keep the world mask unchanged and snap only its paint.
            const left=edge(x,transform.a,transform.e),top=edge(y,transform.d,transform.f);
            ctx.rect(left,top,edge(x+w,transform.a,transform.e)-left,edge(y+h,transform.d,transform.f)-top);
          }else ctx.rect(x,y,w,h);
        }
        ctx.fillStyle=color;ctx.fill();
      }
    }
  };
}

let rain = Array.from({ length: 140 }, (_, i) => ({ x: hash(i, 1) * WORLD_W, y: hash(i, 2) * WORLD_H, speed: 170 + hash(i, 3) * 120 }));

let sceneSeason = seasonTransition();
function pausePulse(seed, speed = 2) { return farm.paused ? Math.sin(now * speed + seed) : 0; }
function nightStrength() {
  const p = farm.phase;
  return p < .52 ? 0 : p < .70 ? (p-.52)/.18 : p < .90 ? 1 : 1-(p-.90)/.10;
}
function windowColor(day) { return blendHex(day, '#ffe09b', nightStrength()); }
function drawLightGlow(x, y, radius, alpha) {
  const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
  glow.addColorStop(0, `rgba(255,207,121,${alpha})`);
  glow.addColorStop(1, 'rgba(255,207,121,0)');
  ctx.fillStyle = glow; ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
}
