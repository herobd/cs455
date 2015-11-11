
#include "sceneobject.h"

SceneObject::SceneObject()
{
    reflective=false;
    transparent=false;
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
            retIntersection->inside = false;
            //cout << "sph intersection at dist: " << t <<endl;
        }
        
        //cout << "d: " << d << endl;
        //cout << "t_ca: " << t_ca << endl;
        //cout << "t_hc_sqr2: " << t_hc_sqr2 << endl;
        
        return true;
    }
    else
    {
        double t_ca = rayOrientation.ddot(OC);
        double t_hc_sqr2 = radius*radius - pow(norm(OC),2) + t_ca*t_ca;
        
        if (t_hc_sqr2 < 0)
            return false;
        //else
        double t = t_ca+sqrt(t_hc_sqr2);
        
        if (retIntersection != NULL)
        {
            retIntersection->point = rayFrom + t*rayOrientation;
            retIntersection->normal = -1*(retIntersection->point-center)/radius;
            retIntersection->dist = t;//I think
            //assert( fabs(t - norm(retIntersection->point-rayFrom)) < .001);
            retIntersection->so = this;
            retIntersection->inside = true;
            //cout << "sph intersection at dist: " << t <<endl;
        }
    }
    return false;
}

Triangle::Triangle( double x1, double y1, double z1, 
                    double x2, double y2, double z2,
                    double x3, double y3, double z3)
{
    v[0] = Vec3f(x1,y1,z1);
    v[1] = Vec3f(x2,y2,z2);
    v[2] = Vec3f(x3,y3,z3);
    p_n = (v[1]-v[0]).cross(v[2]-v[0]);
    p_n = p_n/norm(p_n);
    d = -1 * p_n.ddot(v[0]);
    numV=3;
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
    //   p_n *= -1; //I do this later on when p_n is returned
    
    Vec3f intPt = rayFrom + t*rayOrientation;
    
    Vec2f int_uv;
    Vec2f v_uv[numV];
    
    if (fabs(p_n[0]) > max(fabs(p_n[1]),fabs(p_n[2])))//x is dominant
    {
        int_uv = Vec2f(intPt[1],intPt[2]);
        for (int i=0; i<numV; i++)
            v_uv[i] = Vec2f(v[i][1],v[i][2]);
    }
    else if (fabs(p_n[1]) > fabs(p_n[2]))//y is dominant
    {
        int_uv = Vec2f(intPt[0],intPt[2]);
        for (int i=0; i<numV; i++)
            v_uv[i] = Vec2f(v[i][0],v[i][2]);
    }
    else//z is dominant
    {
        int_uv = Vec2f(intPt[0],intPt[1]);
        for (int i=0; i<numV; i++)
            v_uv[i] = Vec2f(v[i][0],v[i][1]);
    }
    
    for (int i=0; i<numV; i++)
        v_uv[i] -= int_uv;//translate to origin
    
    int numCrossings =0;
    int signHolder;
    if (v_uv[0][1] < 0) 
        signHolder=-1;
    else
        signHolder=1;
    int nextSignHolder;
    
    for (int i=0; i<numV; i++)
    {
        if (v_uv[(i+1)%numV][1] < 0)
            nextSignHolder = -1;
        else
            nextSignHolder = 1;
        if (signHolder != nextSignHolder)//crosses v axis
        {
            if (v_uv[i][0]>0 && v_uv[(i+1)%numV][0]>0)
                numCrossings++;
            else if (v_uv[i][0]>0 || v_uv[(i+1)%numV][0]>0)//possible crossing of u axis
            {
                double u_cross = v_uv[i][0] - v_uv[i][1] * (v_uv[(i+1)%numV][0]-v_uv[i][0])/(v_uv[(i+1)%numV][1]-v_uv[i][1]);
                if (u_cross > 0)
                    numCrossings++;
            }
        }
        signHolder = nextSignHolder;
    }
    
    if (numCrossings%2==1)
    {
        if (retIntersection != NULL)
        {
            retIntersection->point = intPt;
            retIntersection->normal = (v_d>0)?-1*p_n:p_n;
            retIntersection->dist = t;//I think
            //assert( fabs(t - norm(intPt-rayFrom)) < .001);
            retIntersection->so = this;
            retIntersection->inside = false;
            //cout << "tri intersection at dist: " << t <<endl;
        }
        return true;
    }
    
    return false;
}
