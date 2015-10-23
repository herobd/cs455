
#ifndef SCENEOBJECT_H
#define SCENEOBJECT_H

#include "opencv2/core/core.hpp"
#include <iostream>

using namespace std;
using namespace cv;

class SceneObject;

typedef struct IntersectionEvent
{
    SceneObject* so;
    Vec3f point;
    Vec3f normal;
    double dist;
} IntersectionEvent;


class SceneObject
{
public:
    SceneObject();
    
    virtual bool intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection) =0;
    
    bool reflective;
    bool transparent;
    Vec3f diffuseColor;
    Vec3f specularColor;
    double phongConstant;
};

class Sphere: public SceneObject
{
public:
    Sphere(double cx, double cy, double cz, double radius);
    virtual bool intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection);
private:
    Vec3f center;
    double radius;
};

class Triangle: public SceneObject
{
public:
    Triangle(double x1, double y1, double z1, 
             double x2, double y2, double z2,
             double x3, double y3, double z3);
    virtual bool intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection);
    
};

#endif
