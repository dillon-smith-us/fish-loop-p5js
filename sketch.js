const LOOP_SECONDS = 8;
const FPS = 60;
const TOTAL_FRAMES = LOOP_SECONDS * FPS;

const FISH_COUNT = 42;
const fish = [];
let bgLayer;

function setup() {
  createCanvas(900, 900);
  frameRate(FPS);
  noStroke();

  bgLayer = createGraphics(width, height);
  drawBackgroundTexture(bgLayer);

  for (let i = 0; i < FISH_COUNT; i++) {
    fish.push(makeFish(i));
  }
}

function draw() {
  const t = (frameCount % TOTAL_FRAMES) / TOTAL_FRAMES;

  image(bgLayer, 0, 0);
  drawLightBloom(t);
  drawSeaGrass(t);

  fish.sort((a, b) => a.depth - b.depth);
  for (const f of fish) {
    drawFish(f, t);
  }
}

function drawBackgroundTexture(g) {
  g.push();
  g.background(18, 44, 50);

  // Vertical murk gradient
  for (let y = 0; y < g.height; y++) {
    const n = y / g.height;
    const c = lerpColor(color(20, 58, 64), color(77, 123, 113), n);
    g.stroke(c);
    g.line(0, y, g.width, y);
  }

  // Soft noise haze
  g.noStroke();
  for (let i = 0; i < 4200; i++) {
    const x = random(g.width);
    const y = random(g.height);
    const a = random(6, 20);
    g.fill(160, 205, 175, random(8, 20));
    g.circle(x, y, a);
  }

  // Distant plant silhouettes
  g.fill(27, 69, 63, 80);
  for (let k = 0; k < 8; k++) {
    const bx = random(g.width * 0.55, g.width * 1.05);
    const by = random(g.height * 0.15, g.height * 0.95);
    const w = random(28, 70);
    const h = random(160, 430);
    g.push();
    g.translate(bx, by);
    g.rotate(random(-0.45, 0.45));
    g.ellipse(0, 0, w, h);
    g.pop();
  }

  g.pop();
}

function drawLightBloom(t) {
  const cx = width * 0.86;
  const cy = height * 0.8;
  const pulse = 0.96 + 0.04 * sin(TWO_PI * t);

  for (let i = 0; i < 7; i++) {
    const r = 340 * pulse + i * 38;
    fill(110, 215, 210, 22 - i * 2);
    circle(cx, cy, r * 2);
  }

  // Dust motes
  for (let i = 0; i < 220; i++) {
    const a = TWO_PI * ((i * 0.618 + t) % 1);
    const r = 260 + 220 * fract(i * 0.37);
    const x = cx + cos(a) * r;
    const y = cy + sin(a * 1.3) * r * 0.55;
    fill(185, 238, 220, 26);
    circle(x, y, 2.1);
  }
}

function drawSeaGrass(t) {
  const baseX = width * 0.83;
  for (let i = 0; i < 20; i++) {
    const x = baseX + i * 11 + 5 * sin(TWO_PI * (t + i * 0.08));
    const h = 180 + i * 8;
    const sway = 18 * sin(TWO_PI * (t + i * 0.13));
    stroke(40, 95, 80, 120);
    strokeWeight(2.2);
    noFill();
    bezier(
      x,
      height,
      x + sway * 0.4,
      height - h * 0.4,
      x + sway,
      height - h * 0.75,
      x + sway * 0.8,
      height - h
    );
  }
  noStroke();
}

function makeFish(i) {
  const depth = random();
  const scaleBase = lerp(0.45, 1.55, depth);
  const swimCycles = random([1, 2, 3]);
  const bobCycles = random([1, 2, 3, 4]);
  const wobbleCycles = random([2, 3, 4, 5]);

  return {
    seed: i * 17.113,
    depth,
    scaleBase,
    dir: random() < 0.5 ? -1 : 1,
    yBase: random(height * 0.18, height * 0.86),
    yAmp: random(8, 70) * (1.35 - depth),
    yCycles: bobCycles,
    xPhase: random(),
    yPhase: random(),
    wobblePhase: random(),
    xCycles: swimCycles,
    wobbleCycles,
    bodyLen: random(40, 110),
    bodyTall: random(18, 52),
    tone: random(10, 50)
  };
}

function drawFish(f, t) {
  const travel = (t * f.xCycles + f.xPhase) % 1;

  const margin = 180;
  const span = width + margin * 2;
  const x = f.dir === 1 ? -margin + travel * span : width + margin - travel * span;

  const y =
    f.yBase +
    f.yAmp * sin(TWO_PI * (t * f.yCycles + f.yPhase)) +
    9 * sin(TWO_PI * (t * 2 + f.seed));

  const wobble = 0.18 * sin(TWO_PI * (t * f.wobbleCycles + f.wobblePhase));
  const facing = f.dir === 1 ? 0 : PI;

  push();
  translate(x, y);
  rotate(facing + wobble);
  scale(f.scaleBase);

  const alpha = map(f.depth, 0, 1, 120, 220);
  fill(f.tone, f.tone + 10, f.tone + 14, alpha);

  // Body
  ellipse(0, 0, f.bodyLen, f.bodyTall);

  // Tail swish loops perfectly via sine at integer cycle rate
  const tailBeat = sin(TWO_PI * (t * 6 + f.seed));
  const tailSwing = 10 * tailBeat;

  beginShape();
  vertex(-f.bodyLen * 0.48, 0);
  vertex(-f.bodyLen * 0.8, -f.bodyTall * 0.36 + tailSwing * 0.22);
  vertex(-f.bodyLen * 0.88, 0);
  vertex(-f.bodyLen * 0.8, f.bodyTall * 0.36 + tailSwing * 0.22);
  endShape(CLOSE);

  // Dorsal and belly fins
  beginShape();
  vertex(-f.bodyLen * 0.08, -f.bodyTall * 0.45);
  vertex(f.bodyLen * 0.08, -f.bodyTall * 0.76);
  vertex(f.bodyLen * 0.22, -f.bodyTall * 0.3);
  endShape(CLOSE);

  beginShape();
  vertex(-f.bodyLen * 0.15, f.bodyTall * 0.3);
  vertex(f.bodyLen * 0.12, f.bodyTall * 0.62);
  vertex(f.bodyLen * 0.2, f.bodyTall * 0.18);
  endShape(CLOSE);

  // Head silhouette bump
  ellipse(f.bodyLen * 0.3, -f.bodyTall * 0.04, f.bodyLen * 0.35, f.bodyTall * 0.66);

  pop();
}

function fract(v) {
  return v - floor(v);
}
