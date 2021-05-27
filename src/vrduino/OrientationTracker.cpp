#include "OrientationTracker.h"

OrientationTracker::OrientationTracker(double imuFilterAlphaIn,  bool simulateImuIn) :
  imu(),
  gyr{0,0,0},
  acc{0,0,0},
  gyrBias{0,0,0},
  gyrVariance{0,0,0},
  accBias{0,0,0},
  accVariance{0,0,0},
  previousTimeImu(0),
  imuFilterAlpha(imuFilterAlphaIn),
  deltaT(0.0),
  simulateImu(simulateImuIn),
  simulateImuCounter(0),
  flatlandRollGyr(0),
  flatlandRollAcc(0),
  flatlandRollComp(0),
  quaternionGyr{1,0,0,0},
  eulerAcc{0,0,0},
  quaternionComp{1,0,0,0}
{
}

void OrientationTracker::initImu() {
  imu.init();
}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::measureImuBiasVariance() {

  //check if imu.read() returns true
  //then read imu.gyrX, imu.accX, ...

  //compute bias, variance.
  //update:
  //gyrBias[0], gyrBias[1], gyrBias[2]
  //gyrVariance[0], gyrVariance[1], gyrVariance[2]
  //accBias[0], accBias[1], accBias[2]
  //accVariance[0], accVariance[1], accVariance[2]

  size_t nsamples = 1000;
  double gyrSamples[nsamples][3];
  double accSamples[nsamples][3];

  size_t count = 0;
  while (count<nsamples)
  {
    if (imu.read())
    {
      gyrSamples[count][0] = imu.gyrX;
      gyrSamples[count][1] = imu.gyrY;
      gyrSamples[count][2] = imu.gyrZ;
      accSamples[count][0] = imu.accX;
      accSamples[count][1] = imu.accY;
      accSamples[count][2] = imu.accZ;
      gyrBias[0] += imu.gyrX;
      gyrBias[1] += imu.gyrY;
      gyrBias[2] += imu.gyrZ;
      accBias[0] += imu.accX;
      accBias[1] += imu.accY;
      accBias[2] += imu.accZ;
      // Serial.printf("Test: %.5f %.5f %.5f %.5f %.5f %.5f \n", 
        // gyrSamples[count][0], gyrSamples[count][1], gyrSamples[count][2],
        // accSamples[count][0], accSamples[count][1], accSamples[count][2]);
      count++;
    }
  }

  gyrBias[0] /= count;
  gyrBias[1] /= count;
  gyrBias[2] /= count;
  accBias[0] /= count;
  accBias[1] /= count;
  accBias[2] /= count;

  for (size_t i = 0; i < count; i++)
  {
    for (size_t j = 0; j < 3; j++)
    {
      double gyrDiff = gyrSamples[i][j] - gyrBias[j];
      double accDiff = accSamples[i][j] - accBias[j];
      gyrVariance[j] += (gyrDiff*gyrDiff)/(count-1);
      accVariance[j] += (accDiff*accDiff)/(count-1);
    }
  }
  

}

void OrientationTracker::setImuBias(double bias[3]) {
  for (int i = 0; i < 3; i++) {
    gyrBias[i] = bias[i];
  }
}

void OrientationTracker::resetOrientation() {
  flatlandRollGyr = 0;
  flatlandRollAcc = 0;
  flatlandRollComp = 0;
  quaternionGyr = Quaternion();
  eulerAcc[0] = 0;
  eulerAcc[1] = 0;
  eulerAcc[2] = 0;
  quaternionComp = Quaternion();

}

bool OrientationTracker::processImu() {
  if (simulateImu) {
    //get imu values from simulation
    updateImuVariablesFromSimulation();
  } else {
    //get imu values from actual sensor
    if (!updateImuVariables()) {
      //imu data not available
      return false;
    }
  }
  //run orientation tracking algorithms
  updateOrientation();
  return true;
}

void OrientationTracker::updateImuVariablesFromSimulation() {
    deltaT = 0.002;
    //get simulated imu values from external file
    for (int i = 0; i < 3; i++) {
      gyr[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    for (int i = 0; i < 3; i++) {
      acc[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    simulateImuCounter = simulateImuCounter % nImuSamples;

    //simulate delay
    delay(1);
}

/**
 * TODO: see documentation in header file
 */
bool OrientationTracker::updateImuVariables() {

  //sample imu values
  if (!imu.read()) {
  // return false if there's no data
    return false;
  }

  //call micros() to get current time in microseconds
  //update:
  //previousTimeImu (in seconds)
  //deltaT (in seconds)
  float currTime = ((float)micros())/1000000.0;
  deltaT = currTime - previousTimeImu;
  previousTimeImu = currTime;

  //read imu.gyrX, imu.accX ...
  //update:
  //gyr[0], ...
  //acc[0], ...

  // You also need to appropriately modify the update of gyr as instructed in (2.1.3).
  gyr[0] = imu.gyrX - gyrBias[0];
  gyr[1] = imu.gyrY - gyrBias[1];
  gyr[2] = imu.gyrZ - gyrBias[2];

  acc[0] = imu.accX;
  acc[1] = imu.accY;
  acc[2] = imu.accZ;

  return true;

}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::updateOrientation() {

  //call functions in OrientationMath.cpp.
  //use only class variables as arguments to functions.

  //update:
  //flatlandRollGyr
  //flatlandRollAcc
  //flatlandRollComp
  //quaternionGyr
  //eulerAcc
  //quaternionComp

  flatlandRollComp = computeFlatlandRollComp(flatlandRollGyr, gyr, flatlandRollAcc, deltaT, imuFilterAlpha);
  flatlandRollGyr = computeFlatlandRollGyr(flatlandRollGyr, gyr, deltaT);
  flatlandRollAcc = computeFlatlandRollAcc(acc);
  updateQuaternionGyr(quaternionGyr, gyr, deltaT);
  eulerAcc[0] = computeAccPitch(acc);
  eulerAcc[2] = computeAccRoll(acc);
  updateQuaternionComp(quaternionComp, gyr, acc, deltaT, imuFilterAlpha);

}
