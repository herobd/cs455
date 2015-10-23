CXX = g++-4.9
CXX_FLAGS = -std=c++11 -g -c -Wall

SOURCES += main.cpp

LIBS += -L/urs/local/include/opencv2 -lopencv_core -lopencv_highgui
PROGRAM_NAME = rayTracer

MAIN_OBJ_FILES =  main.o sceneobject.o

bin: $(PROGRAM_NAME)

clean:
	- rm -f $(PROGRAM_NAME)
	- rm -f $(MAIN_OBJ_FILES)
	

rayTracer: $(MAIN_OBJ_FILES)
	g++  $(MAIN_OBJ_FILES) -o $(PROGRAM_NAME) $(LIBS)
	
main.o: main.cpp sceneobject.h
	$(CXX) $(CXX_FLAGS) main.cpp -o main.o $(LIBS)
	
sceneobject.o: sceneobject.cpp sceneobject.h
	$(CXX) $(CXX_FLAGS) sceneobject.cpp $(LIBS) -o sceneobject.o
