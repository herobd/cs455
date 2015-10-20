/*Brian Davis
 *2015
 *Simple Ray Tracer
 *for cs455
 */

#include <iostream>
#include <assert.h>
#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"

using namespace std;
using namespace cv;

Vec3f traceRay(Vec3f rayFrom, Vec3f rayOrientation, const vector<SceneObject>& scene, Vec3f lightDir, Vec3f lightColor, Vec3f lightAmb, Vec3f bgColor)
{
    for (SceneObject so : scene)
    {
        Vec3f intersection;
        if (so.intersectionRay(rayFrom,rayOrientation,intersection))
        {
            Vec3f lightFromSource = traceSource(intersection, lightDir, lightColor);
            Vec3f lightFromRefl(0,0,0);
            Vec3f lightFromTran(0,0,0);
            if (so.reflective)
                lightFromRefl = rayTrace();
            if (so.transparent)
                lightFromTran = rayTrace();
            
            
        }
        
    }
}

int main (int argc, char** argv)
{
    vector<SceneObject> scene;
    int windowSize;//assuming square
    int viewDepth;
    //assuming we are looking at (0,0,0) form z axis and (0,1,0) is up
    Vec3f lightDir, lightColor, lightAmb, bgColor;
    parseFile(argv[1],&scene,&windowSize,&viewDepth,&lightDir,&lightColor,&lightAmb,&bgColor);
    double scale = 1.0
    Mat res(windowSize*scale,windowSize*scale,CV_UF3);
    
    Vec3f rayFrom(0,0,viewDepth)
    for (int x=0; x<res.cols; x++)
        for (int y=0; y<res.rows; y++)
        {
            Vec3f rayTo(x/scale,y/scale,0);
            Vec3f rayOrientation = (rayTo-rayFrom)
            normalize(rayOrientation,rayOrientation);
            Vec3f color = traceRay(rayFrom,rayOrientation,scene,lightDir,lightColor,lightAmb,bgColor);
            res.at<Vec3f>(y,x) = color;
        }
    
    imshow("render",res);
    waitKey();
    return 0;
}
