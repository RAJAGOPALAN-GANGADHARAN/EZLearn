
let webcam_output;
let poseNet;
let poses = [];

var cnv;

function setup() {

  cnv=createCanvas(250, 250);
  webcam_output = createCapture(VIDEO);
  console.log(width, height);
  webcam_output.size(width, height);

  cnv.position(1080+200, 57);
  poseNet = ml5.poseNet(webcam_output, modelReady);

  poseNet.on('pose', function(results) {
    poses = results;
  });

  webcam_output.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {

  // show the image we currently have of the webcam output.
  image(webcam_output, 0, 0, width, height);

  // draw the points we have got from the poseNet model
  drawKeypoints();
  // draw the lines too.
  drawSkeleton();
}

function drawKeypoints(){
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse if the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        // choosing colour. RGB where each colour ranges from 0 255
        fill(0, 0, 255);
        // disable drawing outline
        noStroke();
        /* draw a small ellipse. Which being so small looks like a dot. Purpose complete.
            input: X position of the point in the 2D image
                   Y position as well
                   width in px of the ellipse. 10 given
                   height in px of the ellipse. 10 given
        */
        ellipse(keypoint.position.x, keypoint.position.y, 3, 3);
      }
    }
  }
}

function drawSkeleton() {

  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      // line start point
      let startPoint = skeleton[j][0];
      // line end point
      let endPoint = skeleton[j][1];
      // Sets the color used to draw lines and borders around shapes
      stroke(0, 255, 0);
      /* draw a line:
            input: X position of start point of line in this 2D image
                   Y position as well
                   X position of end point of line in this 2D image
                   Y position as well
          */
      line(startPoint.position.x, startPoint.position.y, endPoint.position.x, endPoint.position.y);
    }
  }
}
