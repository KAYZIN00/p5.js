let messages = ["Hsu Eain Si", "Kay Zin Myo Aung", "Nyein Nyein Ei"];
//let messages2 = ["Let's save the trees"];
let textX = -200; // Start off-screen
let titleAlpha = 0;
let sunY = 650; // Start below the canvas (hidden behind green)
let textAlpha = 255; // For fading out the sliding text
let textDisappeared = false; // Track if text has disappeared

let personX = -100; // Start off-screen
let personEnteringActive = false;

let personY = 520; // Add this at the top with your globals
let raisingUp = false;


//let personShaking = false;
//let shakeStartTime = 0;

let axeState = "idle"; // "idle", "up", "down", "done"
let axeStartTime = 0;


let tree1X = 0;
let tree2X = 0;

let tree1Y = 0;
let tree2Y = 0;
let treeFalling = false;
let treeFallSpeed = 5;
let treeFallen = false;
let treeFallPhase = "idle"; // "idle", "float", "fall", "done"
let floatAmount = 0;

let tree1Angle = 0; 
let tree2Angle = 0; // NEW: for rotation

let personExiting = false;

let clouds = [];
let cloudsEnabled = false;

let bgColor = [215, 252, 255]; // initial light blue
let bgTargetColor = [215, 252, 255]; // target color

let isRaining = false;

let isFlooding = false;
let floodY = 650; // Start below the canvas
let rainStartTime = null;

let showEnd = false;



function setup() {
  createCanvas(800, 650);
}

function draw() {
   // Smoothly interpolate each channel toward the target
  for (let i = 0; i < 3; i++) {
    bgColor[i] = lerp(bgColor[i], bgTargetColor[i], 0.03); // 0.03 = speed, adjust as you like
  }
  background(bgColor[0], bgColor[1], bgColor[2]);

  

  // Only start sun rising after text has disappeared
  if (textDisappeared && sunY > 100) {
    sunY -= 2;
  }
  drawSun();

  fill(55, 125, 23);
  arc(700, 530, 600, 150, radians(170), radians(350));

  fill(55, 125, 23);
  rect(0, 500, 800, 150); //ground

  showTitleText();

  // Show sliding text only after title is fully visible and text hasn't disappeared
  if (titleAlpha >= 255 && !textDisappeared) {
    showSlidingText();
    fadeOutSlidingText();
  }

  
  drawTree();
  if (treeFalling) {
  fallTree();
}


   if (personEnteringActive || personExiting) {
  personEntering();
}

if (personExiting) {
  personX += 5; // Move right
  if (personX > width + 50) {
    personExiting = false; // Stop when off screen
    cloudsEnabled = true;  // <-- Enable clouds after exit
  }
}
  drawClouds();

  if (isRaining) {
  if (rainStartTime === null) {
    rainStartTime = millis();
  }
  raining();

  // Start flooding after 2 seconds of rain
  if (!isFlooding && millis() - rainStartTime > 2000) {
    isFlooding = true;
  }
} else {
  rainStartTime = null; // Reset if rain stops
}
if (isFlooding) {
  flooding();
}

if (showEnd) {
    endPart();
    noLoop(); // Stop draw loop if you want everything to freeze
  }
}



function personEntering() {
  const targetX = 650; // Center between the trees
  const standingY = 520; // Default ground level
  const raisedY = 470;   // Raised position (in front of trees)

  // Move person to the right until near the trees (x=620)
  if (axeState === "idle" && personX < targetX) {
    personX += 4;
  } else if (axeState === "idle" && personX >= targetX && personY === standingY) {
    raisingUp = true;
  }

  // Animate raising up before axe animation
  if (raisingUp && personY > raisedY) {
    personY -= 3; // Adjust speed as needed
    if (personY <= raisedY) {
      personY = raisedY;
      raisingUp = false;
      axeState = "up";
      axeStartTime = millis();
    }
  }

  // Axe animation logic
  let axeAngle = 0;
  if (axeState === "up") {
    let t = (millis() - axeStartTime) / 300;
    axeAngle = lerp(0, -PI / 3, constrain(t, 0, 1));
    if (t >= 1) {
      axeState = "down";
      axeStartTime = millis();
    }
  } else if (axeState === "down") {
    let t = (millis() - axeStartTime) / 300;
    axeAngle = lerp(-PI / 3, 0, constrain(t, 0, 1));
    if (t >= 1) {
      axeState = "done";
    }
  } else if (axeState === "done") {
    axeAngle = 0;
  }

  // Draw human figure at (personX, personY)
  push();
  translate(personX, personY);

  // Body
  noStroke();
  fill(220, 180, 140);
  ellipse(0, -30, 30, 30); // Head
  fill(0, 102, 204);
  quad(-9, -15, 9, -15, 15, 25, -15, 25); // Body
  
  // Arms
  stroke(0);
  strokeWeight(4);
  line(-10, 0, -30, 20); // Left arm

  // Right arm (holding axe)
  push();
  translate(10, 0);
  rotate(axeAngle);
  line(0, 0, 20, 20); // Right arm
  // Axe
  stroke(120, 80, 40);
  strokeWeight(5);
  line(20, 20, 35, 0); // Axe handle
  stroke(190);
  strokeWeight(8);
  line(35, 0, 43, 7); // Axe blade
  pop();

  // Legs
  strokeWeight(4);
  line(-6, 25, -6, 50);
  line(6, 25, 6, 50);

  pop();
}

// In your keyPressed function, also reset personY and raisingUp:
function keyPressed() {
  if (key === 'l' || key === 'L') {
    personX = -100;
    personY = 520;
    raisingUp = false;
    personEnteringActive = true;
    axeState = "idle";
  }
}

// Function to fade out the sliding text
function fadeOutSlidingText() {
  // Start fading out after the text has finished sliding in
  if (textX >= 100 && textAlpha > 0) {
    textAlpha -= 5; // Adjust speed of fade out
    if (textAlpha <= 0) {
      textAlpha = 0;
      textDisappeared = true;
    }
  }
}

function showSlidingText() {
  fill(26, 64, 8, textAlpha);
  textSize(30);
  for (let i = 0; i < messages.length; i++) {
    text(messages[i], textX, 300 + i * 50);
  }
  // Move text to the right until it reaches x=100
  if (textX < 100) {
    textX += 3;
  }
}

function showTitleText() {
  // Fade in the title text
  if (titleAlpha < 255 && !textDisappeared) {
    titleAlpha += 1; // Increase for faster fade-in
  }
  // Fade out the title text together with the names
  if (textDisappeared && titleAlpha > 0) {
    titleAlpha -= 5; // Adjust speed of fade out
    if (titleAlpha < 0) titleAlpha = 0;
  }
  fill(26, 64, 8, titleAlpha);
  textSize(45);
  textAlign(CENTER, TOP);
  text("Let's Save Trees", width / 2, 10);
  textAlign(LEFT, BASELINE);
}

function drawSun() {
  noStroke();
  fill(255, 218, 27);
  ellipse(200, sunY, 100, 100);
}



function drawTree() {
  // Lower trunks (don't move)
  fill(74, 37, 4);
  rect(550, 430, 40, 70); // Tree1 lower part
  rect(690, 430, 40, 70); // Tree2 lower part

  // Upper trunks (move and rotate)
  push();
  translate(550 + tree1X + 20, 400 + tree1Y + floatAmount + 15); // center of upper part
  rotate(-tree1Angle); // Tree1 falls to the left
  fill(74, 37, 4);
  rect(-20, -15, 40, 30); // Tree1 upper part
  fill(26, 64, 8);
  triangle(-50, -15, 0, -115, 50, -15); // tree1 leaf (wider)
  pop();

  push();
  translate(690 + tree2X + 20, 400 + tree2Y + floatAmount + 15);
  rotate(-tree2Angle); // Tree2 also falls to the left
  fill(74, 37, 4);
  rect(-20, -15, 40, 30); // Tree2 upper part
  fill(26, 64, 8);
  triangle(-50, -15, 0, -115, 50, -15); // tree2 leaf (wider)
  pop();
}
function fallTree() {
  if (treeFallPhase === "float") {
    // Float up a bit
    if (floatAmount > -30) {
      floatAmount -= 2;
    } else {
      treeFallPhase = "fall";
    }
  } else if (treeFallPhase === "fall") {
    // Tree1 falls in place
    let targetX1 = 0; // No horizontal move for tree1
    let targetY1 = 540 - (400 + floatAmount + 15); // green ground top - current y (was 500, now 540)

    // Tree2 falls a little to the right and down
    let targetX2 = 40; // Move tree2 a bit to the right (adjust as you like)
    let targetY2 = 560 - (400 + floatAmount + 15); // Move tree2 a bit further down (was 520, now 560)

    // Move and rotate tree1
    if (Math.abs(tree1X - targetX1) > 2) tree1X += (targetX1 - tree1X) * 0.1;
    if (Math.abs(tree1Y - targetY1) > 2) tree1Y += (targetY1 - tree1Y) * 0.1;
    if (tree1Angle < HALF_PI) tree1Angle += 0.08;
    if (tree1Angle > HALF_PI) tree1Angle = HALF_PI;

    // Move and rotate tree2
    if (Math.abs(tree2X - targetX2) > 2) tree2X += (targetX2 - tree2X) * 0.1;
    if (Math.abs(tree2Y - targetY2) > 2) tree2Y += (targetY2 - tree2Y) * 0.1;
    if (tree2Angle < HALF_PI) tree2Angle += 0.08;
    if (tree2Angle > HALF_PI) tree2Angle = HALF_PI;

    if (
  Math.abs(tree1X - targetX1) <= 2 &&
  Math.abs(tree2X - targetX2) <= 2 &&
  Math.abs(tree1Y - targetY1) <= 2 &&
  Math.abs(tree2Y - targetY2) <= 2 &&
  tree1Angle >= HALF_PI &&
  tree2Angle >= HALF_PI) 
  {
  tree1X = targetX1;
  tree2X = targetX2;
  tree1Y = targetY1;
  tree2Y = targetY2;
  tree1Angle = HALF_PI;
  tree2Angle = HALF_PI;
  treeFallPhase = "done";
  treeFallen = true;
  personEnteringActive = false; // Stop standing animation
  personExiting = true;         // Start exit animation
   }
  }
}
// In keyPressed, reset the angles and positions:
function keyPressed() {
  if (key === 'l' || key === 'L') {
    personX = -100;
    personY = 520;
    raisingUp = false;
    personEnteringActive = true;
    axeState = "idle";
  }
  if (key === 'f' || key === 'F') {
    treeFalling = true;
    treeFallen = false;
    tree1Y = 0;
    tree2Y = 0;
    tree1X = 0;
    tree2X = 0;
    floatAmount = 0;
    treeFallPhase = "float";
    tree1Angle = 0;
    tree2Angle = 0;
  }
}
function clickClouds() {
  // Add a new cloud at the mouse position
  clouds.push({ x: mouseX, y: mouseY, size: random(40, 80) });
}
function drawClouds() {
  for (let c of clouds) {
    drawCloud(c.x, c.y, c.size);
  }
}

// Helper function to draw a cloud at (x, y) with a given size
function drawCloud(x, y, size) {
  noStroke();
  fill(150, 150, 150, 220); // grey color
  ellipse(x, y, size * 1.7, size * 1.1); // bigger main cloud
  ellipse(x - size * 0.6, y + size * 0.1, size * 1.1, size * 0.8);
  ellipse(x + size * 0.6, y + size * 0.1, size * 1.1, size * 0.8);
}
// Add this function to handle mouse clicks
function mousePressed() {
  if (cloudsEnabled) {
    clickClouds();
  }
}
function changeBackgroundColor() {
  // If there are 10 or more clouds, set to darker blue and start rain
  if (clouds.length >= 7) {
    bgTargetColor = [134, 167, 170]; // darker blue
    isRaining = true;
  } else {
    bgTargetColor = [215, 252, 255]; // light blue
    isRaining = false;
  }
}
function clickClouds() {
  if (clouds.length >= 13) return; // Stop adding clouds after 15
  clouds.push({ x: mouseX, y: mouseY, size: random(40, 80) });
  changeBackgroundColor(); // check and update background color
}
function raining() {
  // Draw rain on the lower 3/4 of the screen (not on the top 1/4)
  for (let i = 0; i < 200; i++) {
    let x = random(0, width);
    let y = random(height * 0.25, height); // Only below top 1/4
    stroke(180, 180, 255, 180);
    line(x, y, x, y + 15);
  }
  noStroke();
}

function flooding() {
  // Raise the water until it reaches the green ground (y=480)
  if (floodY > 480) {
    floodY -= 2; // Adjust speed as you like
    if (floodY < 480) floodY = 480;
  }
  // When flooding is done, show the end screen
  if (floodY === 480 && !showEnd) {
    showEnd = true;
  }
  noStroke();
  fill(76, 158, 164); // Water blue
  rect(0, floodY, width, height - floodY);
}

function endPart() {
  // Draw black screen and "THE END!!" text in the center
  fill(0, 200); // Black with some opacity
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(60);
  text("THE END!!", width / 2, height / 2);
}



