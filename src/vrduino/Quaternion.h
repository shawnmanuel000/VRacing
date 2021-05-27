/**
 * Quaternion class
 *
 * We are using C++! Not JavaScript!
 * Unlike JavaScript, "this" keyword is representing a pointer!
 * If you want to access the member variable q[0], you should write
 * this->q[0].
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

#ifndef QUATERNION_H
#define QUATERNION_H

#include "Arduino.h"
#include "math.h"

class Quaternion {
public:

  /***
   * public member variables to hold the values
   *
   * Definition:
   * q = q[0] + q[1] * i + q[2] * j + q[3] * k
   */
  double q[4];

  /* Default constructor */
  Quaternion() : q{1.0, 0.0, 0.0, 0.0} {}

  /* Constructor with some inputs */
  Quaternion(double q0, double q1, double q2, double q3) : q{q0, q1, q2, q3} {}

  /* function to create another quaternion with the same values. */
  Quaternion clone() {
    return Quaternion(this->q[0], this->q[1], this->q[2], this->q[3]);
  }

  /* function to construct a quaternion from angle-axis representation. angle is given in degrees. */
  Quaternion& setFromAngleAxis(double angle, double vx, double vy, double vz) {
    angle = angle * M_PI / 180.0;
    this->q[0] = cos(angle/2.0);
    this->q[1] = vx*sin(angle/2.0);
    this->q[2] = vy*sin(angle/2.0);
    this->q[3] = vz*sin(angle/2.0);
    return *this;
  }

  /* function to compute the length of a quaternion */
  double length() {
    double qw2 = pow(this->q[0],2.0);
    double qx2 = pow(this->q[1],2.0);
    double qy2 = pow(this->q[2],2.0);
    double qz2 = pow(this->q[3],2.0);
    return pow(qw2+qx2+qy2+qz2,0.5);
  }

  /* function to normalize a quaternion */
  Quaternion& normalize() {
    double len = this->length();
    this->q[0] /= len; 
    this->q[1] /= len; 
    this->q[2] /= len; 
    this->q[3] /= len; 
    return *this;
  }

  /* function to invert a quaternion */
  Quaternion& inverse() {
    double len2 = pow(this->length(),2.0);
    this->q[0] *= 1.0/len2;
    this->q[1] *= -1.0/len2;
    this->q[2] *= -1.0/len2;
    this->q[3] *= -1.0/len2;
    return *this;
  }

  /* function to multiply two quaternions */
  Quaternion multiply(Quaternion a, Quaternion b) {
    Quaternion n;
    double qw = a.q[0];
    double qx = a.q[1];
    double qy = a.q[2];
    double qz = a.q[3];
    double pw = b.q[0];
    double px = b.q[1];
    double py = b.q[2];
    double pz = b.q[3];
    n.q[0] = qw*pw - qx*px - qy*py - qz*pz;
    n.q[1] = qw*px + qx*pw + qy*pz - qz*py;
    n.q[2] = qw*py - qx*pz + qy*pw + qz*px;
    n.q[3] = qw*pz + qx*py - qy*px + qz*pw;
    return n;
  }

  /* function to rotate a quaternion by r * q * r^{-1} */
  Quaternion rotate(Quaternion r) {
    return Quaternion::multiply(Quaternion::multiply(r, *this), r.inverse());
  }

  /* helper function to print out a quaternion */
  void serialPrint() {
    Serial.print(q[0]);
    Serial.print(" ");
    Serial.print(q[1]);
    Serial.print(" ");
    Serial.print(q[2]);
    Serial.print(" ");
    Serial.print(q[3]);
    Serial.println();
  }
};

#endif // ifndef QUATERNION_H
