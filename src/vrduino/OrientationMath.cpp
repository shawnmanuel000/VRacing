#include "OrientationMath.h"
#include "math.h"

float DEG_FROM_RAD = 180.0/M_PI;
float RAD_FROM_DEG = M_PI/180.0;

double norm(double x, double y, double z) {
  return pow(x*x + y*y + z*z,0.5);
}

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {
  float sign_ay = acc[1]/abs(acc[1]);
  float axy_norm = pow(pow(acc[0],2)+pow(acc[1],2),0.5);
  return -atan2(acc[2], sign_ay*axy_norm) * DEG_FROM_RAD;
}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {
  return -atan2(-acc[0], acc[1]) * DEG_FROM_RAD;
}

/** TODO: see documentation in header file */
double computeFlatlandRollGyr(double flatlandRollGyrPrev, double gyr[3], double deltaT) {
  return flatlandRollGyrPrev + deltaT*gyr[2];
}

/** TODO: see documentation in header file */
double computeFlatlandRollAcc(double acc[3]) {
  return atan(acc[0]/acc[1]);
}

/** TODO: see documentation in header file */
double computeFlatlandRollComp(double flatlandRollCompPrev, double gyr[3], double flatlandRollAcc, double deltaT, double alpha) {
  float flatlandRollGyr = computeFlatlandRollGyr(flatlandRollCompPrev, gyr, deltaT);
  return alpha*flatlandRollGyr + (1-alpha)*flatlandRollAcc;
}

/** TODO: see documentation in header file */
void updateQuaternionGyr(Quaternion& q, double gyr[3], double deltaT) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  double qx = gyr[0];
  double qy = gyr[1];
  double qz = gyr[2];
  double magnitude = norm(qx, qy, qz);
  if (magnitude > 1e-8)
  {
    double angle = deltaT*magnitude;
    double vx = qx/magnitude;
    double vy = qy/magnitude;
    double vz = qz/magnitude;
    Quaternion q_delta = Quaternion().setFromAngleAxis(angle, vx, vy, vz);
    q = Quaternion().multiply(q, q_delta).normalize();
  }
}

/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  updateQuaternionGyr(q, gyr, deltaT);
  Quaternion q_a_body = Quaternion(0, acc[0], acc[1], acc[2]);
  Quaternion q_a_world = q_a_body.rotate(q).normalize();
  double phi = acos(q_a_world.q[2]) * 180.0/M_PI;
  double vx = q_a_world.q[1];
  double vz = q_a_world.q[3];
  double nnorm = norm(vx,0,vz);
  if (nnorm > 1e-8)
  {
    Quaternion qt_alpha = Quaternion().setFromAngleAxis((1-alpha)*phi, -vz/nnorm, 0.0, vx/nnorm).normalize();
    Quaternion q = Quaternion().multiply(qt_alpha, q).normalize();
  }
}
