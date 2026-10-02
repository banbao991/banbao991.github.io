// Signed Q16.144 fixed point: ten base-65536 limbs, low limb first.
// The multiply retains limbs 9..18 of the 320-bit intermediate product.
alias Big = array<u32, 10>;

@group(0) @binding(0) var<storage, read> params: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<u32>;

fn load_big(offset: u32) -> Big {
  var value: Big;
  for (var i = 0u; i < 10u; i++) { value[i] = params[offset + i]; }
  return value;
}

fn add(a: Big, b: Big) -> Big {
  var out: Big;
  var carry = 0u;
  for (var i = 0u; i < 10u; i++) {
    let sum = a[i] + b[i] + carry;
    out[i] = sum & 65535u;
    carry = sum >> 16u;
  }
  return out;
}

fn negative(a: Big) -> Big {
  var out: Big;
  var carry = 1u;
  for (var i = 0u; i < 10u; i++) {
    let sum = (65535u ^ a[i]) + carry;
    out[i] = sum & 65535u;
    carry = sum >> 16u;
  }
  return out;
}

fn subtract(a: Big, b: Big) -> Big { return add(a, negative(b)); }

fn times_small(a: Big, factor: u32) -> Big {
  var out: Big;
  var carry = 0u;
  for (var i = 0u; i < 10u; i++) {
    let product = a[i] * factor + carry;
    out[i] = product & 65535u;
    carry = product >> 16u;
  }
  return out;
}

fn multiply(a: Big, b: Big) -> Big {
  let a_negative = (a[9] & 32768u) != 0u;
  let b_negative = (b[9] & 32768u) != 0u;
  var aa = a;
  var bb = b;
  if (a_negative) { aa = negative(a); }
  if (b_negative) { bb = negative(b); }
  var product: array<u32, 20>;
  for (var i = 0u; i < 10u; i++) {
    var carry = 0u;
    for (var j = 0u; j < 10u; j++) {
      let k = i + j;
      let sum = aa[i] * bb[j] + product[k] + carry;
      product[k] = sum & 65535u;
      carry = sum >> 16u;
    }
    product[i + 10u] = carry;
  }
  var out: Big;
  for (var i = 0u; i < 10u; i++) { out[i] = product[i + 9u]; }
  if (a_negative != b_negative) { return negative(out); }
  return out;
}

fn approximate(a: Big) -> f32 {
  let is_negative = (a[9] & 32768u) != 0u;
  var value = a;
  if (is_negative) { value = negative(a); }
  let magnitude = f32(value[9]) + f32(value[8]) / 65536.0;
  return select(magnitude, -magnitude, is_negative);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let width = params[0];
  let height = params[1];
  if (id.x >= width || id.y >= height) { return; }
  let point_x = add(load_big(4u), times_small(load_big(24u), id.x));
  let point_y = subtract(load_big(14u), times_small(load_big(24u), id.y));
  let julia = params[3] == 1u;
  var zx: Big;
  var zy: Big;
  if (julia) { zx = point_x; zy = point_y; }
  var cr = point_x;
  var ci = point_y;
  if (julia) { cr = load_big(34u); ci = load_big(44u); }
  let pixel = (id.y * width + id.x) * 2u;
  result[pixel] = 0xffffffffu;
  result[pixel + 1u] = 0u;
  for (var n = 0u; n < params[2]; n++) {
    let real = add(subtract(multiply(zx, zx), multiply(zy, zy)), cr);
    let imaginary = add(times_small(multiply(zx, zy), 2u), ci);
    zx = real;
    zy = imaginary;
    let x = approximate(zx);
    let y = approximate(zy);
    let radius = x * x + y * y;
    if (radius > 16.0) {
      result[pixel] = n;
      result[pixel + 1u] = bitcast<u32>(radius);
      break;
    }
  }
}
