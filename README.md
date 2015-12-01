This is my code for CS 455 (Computer Graphics).
I'm using WebGL for my projects, you can view the finished projects at mr-briandavis.rhcloud.com/projects

The exception is the ray tracer, which is written in C++, using a OpenCV for image manipulation and as a vector library. It is very simple. Its usage is:

`./rayTracer [scene].rayTracing [output].png` (or other image file extension)

You can look at the included .rayTracing files for examples of the format. It only supports sphere and triangular polygon objects. The only parameter you can change on the camera is its z position (LookFrom). There is no point/area lighting.
