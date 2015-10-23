
#include "sceneobject.h"

SceneObject::SceneObject()
{
    reflective=false;
}

bool SceneObject::intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection)
{
    return false;
}


Sphere::Sphere(double cx, double cy, double cz, double radius)
{
    center = Vec3f(cx,cy,cz);
    this->radius = radius;
}

bool Sphere::intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection)
{
    Vec3f OC = center - rayFrom;
    if (normV(OC) >= radius)
    {
        double d = normV(rayOrientation.cross(rayFrom-center));
        
        double t_ca = rayOrientation.ddot(OC);
        if (t_ca <0)
            return false;
        //else
        double t_hc_sqr = radius*radius - d*d;
        //or
        double t_hc_sqr2 = radius*radius - pow(normV(OC),2) + t_ca*t_ca;
        if (fabs(t_hc_sqr-t_hc_sqr2) >.001)
        {
            cout << "diff t_hc_sqr " << t_hc_sqr << ", " << t_hc_sqr2 << endl;
            cout << "diff d " << d << ", " << (pow(normV(OC),2)-t_ca*t_ca) << endl;
        }
        
        if (t_hc_sqr2 < 0)
            return false;
        //else
        double t = t_ca-sqrt(t_hc_sqr2);
        
        retIntersection->point = rayFrom + t*rayOrientation;
        retIntersection->normal = (retIntersection->point-center)/radius;
        retIntersection->dist = t;//I think
        assert( fabs(t - normV(retIntersection->point-rayFrom)) < .001);
        retIntersection->so = this;
        
        
        cout << "d: " << d << endl;
        cout << "t_ca: " << t_ca << endl;
        cout << "t_hc_sqr2: " << t_hc_sqr2 << endl;
        
        return true;
    }
    else
        cout << "ERROR: ray inside sphere, trans not implemented" << endl;
    return false;
}

Triangle::Triangle( double x1, double y1, double z1, 
                    double x2, double y2, double z2,
                    double x3, double y3, double z3)
{

}

bool Triangle::intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection)
{
    return false;
}
