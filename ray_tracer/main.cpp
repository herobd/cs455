/*Brian Davis
 *2015
 *Simple Ray Tracer
 *for cs455
 */

#include <iostream>
#include <fstream>
#include <assert.h>
#include <regex>
#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"

#include "sceneobject.h"

#define DEPTH_LIMIT 100

using namespace std;
using namespace cv;

Vec3f traceRay(int depth, Vec3f rayFrom, Vec3f rayOrientation, const vector<SceneObject*>& scene, Vec3f lightDir, Vec3f lightColor, Vec3f lightAmb, Vec3f bgColor);
Vec3f traceSource(const vector<SceneObject*>& scene, Vec3f intersection, Vec3f lightDir, Vec3f lightColor);
void parseFile(string filePath , vector<SceneObject*>* scene, double* windowSize, double* viewDepth, Vec3f* lightDir, Vec3f* lightColor, Vec3f* lightAmb, Vec3f* bgColor);



int main (int argc, char** argv)
{
    vector<SceneObject*> scene;
    double windowSize;//assuming square
    double viewDepth;
    //assuming we are looking at (0,0,0) form z axis and (0,1,0) is up
    Vec3f lightDir, lightColor, lightAmb, bgColor;
    
    parseFile(argv[1],&scene,&windowSize,&viewDepth,&lightDir,&lightColor,&lightAmb,&bgColor);
    cout << "windowsize: " << windowSize << " viewDepth: " << viewDepth << endl;
    
    double scale = 100.0/windowSize;
    Mat res(windowSize*scale,windowSize*scale,CV_32FC3);
    
    Vec3f rayFrom(0,0,viewDepth);
    for (int x=0; x<res.cols; x++)
        for (int y=0; y<res.rows; y++)
        //int x = res.cols/2;
        //int y = res.rows/2;
        {
            Vec3f rayTo((x-res.cols/2)/scale,(y-res.rows/2)/scale,0);
            Vec3f rayOrientation = rayTo-rayFrom;
            rayOrientation = rayOrientation/sqrt(rayOrientation[0]*rayOrientation[0] +
                                                 rayOrientation[1]*rayOrientation[1] +
                                                 rayOrientation[2]*rayOrientation[2]);
            //normalize(rayOrientation,rayOrientation);
            //assert(rayOrientation.norm()==1);
            Vec3f color = traceRay(0,rayFrom,rayOrientation,scene,lightDir,lightColor,lightAmb,bgColor);
            res.at<Vec3f>(y,x) = color;
        }
    
    imshow("render",res);
    waitKey();
    return 0;
}




Vec3f traceRay(int depth, Vec3f rayFrom, Vec3f rayOrientation, const vector<SceneObject*>& scene, Vec3f lightDir, Vec3f lightColor, Vec3f lightAmb, Vec3f bgColor)
{
    if (depth++>DEPTH_LIMIT)
        return Vec3f(0,0,0);
    IntersectionEvent closestIntersection;
    closestIntersection.dist=99999;
    closestIntersection.so=NULL;
    
    for (SceneObject* so : scene)
    {
        IntersectionEvent intersection;
        if (so->intersectionRay(rayFrom,rayOrientation,&intersection))
        {
            if (intersection.dist < closestIntersection.dist)
                closestIntersection = intersection;
        }
        
    }
    
    if (closestIntersection.so==NULL)
    {
        //cout << "returning bg" << endl;
        return bgColor;
    }
    
    Vec3f eye = -1*rayOrientation;///reverse ray so it is now Eye vector (going away from object)
    
    Vec3f color;
    Vec3f lightFromSource = traceSource(scene, closestIntersection.point, lightDir, lightColor);
    Vec3f dirOfSourceReflLight = 2*closestIntersection.normal*(closestIntersection.normal.ddot(lightDir)) - lightDir;
    //Vec3f lightFromRefl(0,0,0);
    //Vec3f dirOfRefl(0,0,0);
    Vec3f dirOfReflLight = 2*closestIntersection.normal*(closestIntersection.normal.ddot(eye)) - eye;//I think it should be the same in reverse
    Vec3f lightFromRefl = traceRay(depth,closestIntersection.point,dirOfReflLight,scene,lightDir,lightColor,lightAmb,bgColor);
    Vec3f lightFromTran(0,0,0);
    Vec3f dirOfTran(0,0,0);
    if (closestIntersection.so->reflective)
    {
        
        color = closestIntersection.so->specularColor.mul(lightFromRefl);
    }
    
    else
    {
        color =   closestIntersection.so->diffuseColor.mul(lightAmb) + 
                  lightFromSource.mul( closestIntersection.so->diffuseColor*(std::max(0.0,closestIntersection.normal.ddot(lightDir))) +
                                       closestIntersection.so->specularColor*(pow(std::max(0.0,eye.ddot(dirOfSourceReflLight)),closestIntersection.so->phongConstant))
                                     ) + 
                  lightFromRefl.mul(   closestIntersection.so->diffuseColor*(std::max(0.0,closestIntersection.normal.ddot(dirOfReflLight))) +
                                       closestIntersection.so->specularColor*(pow(std::max(0.0,eye.ddot(dirOfReflLight)),closestIntersection.so->phongConstant))
                                     ) /*+ ?*/;
    }
    //if (so.transparent)//Do we have transparent objects?
    //{
        //dirOfTran =
        //lightFromTran = traceRay();
    //}
    
    return color;
}

Vec3f traceSource(const vector<SceneObject*>& scene, Vec3f intersection, Vec3f lightDir, Vec3f lightColor)
{
    for (SceneObject* so : scene)
    {
        if (so->intersectionRay(intersection,lightDir,NULL))
        {
            return Vec3f(0,0,0);
        }
    }
    return lightColor;
}




void parseFile(string filePath , vector<SceneObject*>* scene, double* windowSize, double* viewDepth, Vec3f* lightDir, Vec3f* lightColor, Vec3f* lightAmb, Vec3f* bgColor)
{
    ifstream file;
    file.open (filePath, ios::in);
    string line;
    
    getline(file,line);
    regex lookatExt("CameraLookAt (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    smatch sm;
    regex_search(line,sm,lookatExt);
    //cout << sm[0] << endl;
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    assert(stof(sm[1])==0 && stof(sm[3])==0 && stof(sm[5])==0);
    
    getline(file,line);
    regex lookfromExt("CameraLookFrom (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,lookfromExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    assert(stof(sm[1])==0 && stof(sm[3])==0);
    *viewDepth = stof(sm[5]);
    
    getline(file,line);
    regex lookupExt("CameraLookUp (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,lookupExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    assert(stof(sm[1])==0 && stof(sm[3])==1 && stof(sm[5])==0);
    
    getline(file,line);
    regex fovExt("FieldOfView (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,fovExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    double fov = stof(sm[1]);
    *windowSize = 2* *viewDepth * tan((CV_PI*fov/180)/2);
    
    getline(file,line);
    regex lightExt("DirectionToLight (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) LightColor (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,lightExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    (*lightDir)[0] = stof(sm[1]);
    (*lightDir)[1] = stof(sm[3]);
    (*lightDir)[2] = stof(sm[5]);
    (*lightColor)[0] = stof(sm[7]);
    (*lightColor)[1] = stof(sm[9]);
    (*lightColor)[2] = stof(sm[11]);
    
    getline(file,line);
    regex ambExt("AmbientLight (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,ambExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    (*lightAmb)[0] = stof(sm[1]);
    (*lightAmb)[1] = stof(sm[3]);
    (*lightAmb)[2] = stof(sm[5]);
    
    getline(file,line);
    regex bgExt("BackgroundColor (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex_search(line,sm,bgExt);
    //cout << sm[1] << "," << sm[3] << "," << sm[5] << endl;
    (*bgColor)[0] = stof(sm[1]);
    (*bgColor)[1] = stof(sm[3]);
    (*bgColor)[2] = stof(sm[5]);
    
    //objects
    regex sphereExt("Sphere Center (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) Radius (-?[0-9]*(\\.[0-9]+)?)");
    regex triangleExt("Triangle (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)   (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)   (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex refExt("Material Reflective (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?)");
    regex difExt("Material Diffuse (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) SpecularHighlight (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) (-?[0-9]*(\\.[0-9]+)?) PhongConstant (-?[0-9]*(\\.[0-9]+)?)");
    while (getline(file,line))
    {
        SceneObject* so=NULL;
        if ( regex_search(line,sm,sphereExt) )
        {
            so = new Sphere(stof(sm[1]),stof(sm[3]),stof(sm[5]),stof(sm[7]));
            //cout << "sph at " << stof(sm[1])<<","<<stof(sm[3])<<","<<stof(sm[5])<<","<<stof(sm[7]) << endl;
        }
        else if ( regex_search(line,sm,triangleExt) )
        {
            so = new Triangle(stof(sm[1]),stof(sm[3]),stof(sm[5]),
                              stof(sm[7]),stof(sm[9]),stof(sm[11]),
                              stof(sm[13]),stof(sm[15]),stof(sm[17]));
        }
        
        if (so==NULL)
        {
            cout << "error not an object: " << line << endl;
            continue;
        }
        
        if ( regex_search(line,sm,refExt) )
        {
            so->specularColor = Vec3f(stof(sm[1]),stof(sm[3]),stof(sm[5]));
            so->reflective=true;
        }
        else if ( regex_search(line,sm,difExt) )
        {
            so->diffuseColor = Vec3f(stof(sm[1]),stof(sm[3]),stof(sm[5]));
            so->specularColor = Vec3f(stof(sm[7]),stof(sm[9]),stof(sm[11]));
            so->phongConstant = stof(sm[13]);
        }
        
        scene->push_back(so);
    }
/*CameraLookAt 0 0 0
CameraLookFrom 0 0 1.2
CameraLookUp 0 1 0
FieldOfView 55
DirectionToLight 0 1 0 LightColor 1 1 1
AmbientLight 0 0 0
BackgroundColor .2 .2 .2
Sphere Center 0 .3 0 Radius .2 Material Reflective .75 .75 .75
Triangle 0 -.5 .5   1 .5 0 0 -.5 -.5    Material Diffuse 0 0 1 SpecularHighlight 1 1 1 PhongConstant 4
Triangle 0 -.5 .5   0 -.5 -.5   -1 .5 0 Material Diffuse 1 1 0 SpecularHighlight 1 1 1 PhongConstant 4*/

    file.close();
}
