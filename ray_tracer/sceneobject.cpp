
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
    rayFrom += .0001*rayOrientation;
    Vec3f OC = center - rayFrom;
    //assert(center[0]-rayFrom[0] == OC[0] && center[1]-rayFrom[1] == OC[1] && center[2]-rayFrom[2] == OC[2]);
    
    //double check = norm(OC);
    //assert(fabs(check-sqrt(OC[0]*OC[0]+OC[1]*OC[1]+OC[2]*OC[2]))<.001);
    
    if (norm(OC) >= radius)
    {
        //double d = norm(rayOrientation.cross(rayFrom-center));
        
        double t_ca = rayOrientation.ddot(OC);
        if (t_ca <0)
            return false;
        //else
        //double t_hc_sqr = radius*radius - d*d;
        //or
        double t_hc_sqr2 = radius*radius - pow(norm(OC),2) + t_ca*t_ca;
        //if (fabs(t_hc_sqr-t_hc_sqr2) >.001)
        //{
        //    cout << "diff t_hc_sqr " << t_hc_sqr << ", " << t_hc_sqr2 << endl;
        //    cout << "diff d " << d << ", " << (pow(norm(OC),2)-t_ca*t_ca) << endl;
        //}
        
        if (t_hc_sqr2 < 0)
            return false;
        //else
        double t = t_ca-sqrt(t_hc_sqr2);
        
        if (retIntersection != NULL)
        {
            retIntersection->point = rayFrom + t*rayOrientation;
            retIntersection->normal = (retIntersection->point-center)/radius;
            retIntersection->dist = t;//I think
            //assert( fabs(t - norm(retIntersection->point-rayFrom)) < .001);
            retIntersection->so = this;
        }
        
        //cout << "d: " << d << endl;
        //cout << "t_ca: " << t_ca << endl;
        //cout << "t_hc_sqr2: " << t_hc_sqr2 << endl;
        
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
    v1 = Vec3f(x1,y1,z1);
    v2 = Vec3f(x2,y2,z2);
    v3 = Vec3f(x3,y3,z3);
    p_n = (v2-v1).cross(v3-v1);
    d = -1 * p_n.ddot(v1);
}

bool Triangle::intersectionRay(Vec3f rayFrom, Vec3f rayOrientation, IntersectionEvent* retIntersection)
{
    rayFrom += .0001*rayOrientation;
    double v_d = p_n.ddot(rayOrientation);
    if (v_d == 0)
        return false;//parallel
    
    double v_o = -(p_n.ddot(rayFrom)+d);
    double t = v_o/v_d;
    if (t<0)//plane behind ray
        return false;
        
    //if (v_d>0)   //Not sure why we are supposed to reverse the plane normal
    //   p_n *= -1;
    
    Vec3f intPt = rayFrom + t*rayOrientation;
    
    Vec2f int_uv;
    Vec2f v1_uv;
    Vec2f v2_uv;
    Vec2f v3_uv;
    
    if (fabs(p_n[0]) > max(fabs(p_n[1]),fabs(p_n[2])))//x is dominant
    {
        int_uv = Vec2f(intPt[1],intPt[2]);
        v1_uv = Vec2f(v1[1],v1[2]);
        v2_uv = Vec2f(v2[1],v2[2]);
        v3_uv = Vec2f(v3[1],v3[2]);
    }
    else if (fabs(p_n[1]) > fabs(p_n[2]))//y is dominant
    {
        int_uv = Vec2f(intPt[0],intPt[2]);
        v1_uv = Vec2f(v1[0],v1[2]);
        v2_uv = Vec2f(v2[0],v2[2]);
        v3_uv = Vec2f(v3[0],v3[2]);
    }
    else//z is dominant
    {
        int_uv = Vec2f(intPt[0],intPt[1]);
        v1_uv = Vec2f(v1[0],v1[1]);
        v2_uv = Vec2f(v2[0],v2[1]);
        v3_uv = Vec2f(v3[0],v3[1]);
    }
    
    v1_uv -= int_uv;//translate to origin
    v2_uv -= int_uv;
    v3_uv -= int_uv;
    
    int numCrossings =0;
    int signHolder;
    if (v_o < 0) //?
        signHolder=-1;
    else
        signHolder=1;
    
    
    
    
    return false;
}
