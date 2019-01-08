POIsam: a System for Efficient Selection of Large-scale Geospatial Data on Maps
In this demonstration we present POIsam, a visualization system supporting the following desirable features: representativeness, visibility constraint, zooming consistency, and panning consistency. The first two constraints aim to efficiently select a small set of representative objects from the current region of user's interest, and any two selected objects should not be too close to each other for users to distinguish in the limited space of a screen. One unique feature of POISam is that any similarity metrics can be plugged into POISam to meet the user's specific needs in different scenarios. The latter two consistencies are fundamental challenges to efficiently update the selection result w.r.t. user's zoom in, zoom out and panning operations when they interact with the map. POISam drops a common assumption from all previous work, i.e. the zoom levels and region cells are pre-defined and indexed, and objects are selected from such region cells at a particular zoom level rather than from user's current region of interest (which in most cases do not correspond to the pre-defined cells). It results in extra challenge as we need to do object selection via online computation. To our best knowledge, this is the first system that is able to meet all the four features to achieve an interactive visualization map exploration system. 

POIsam: a System for Efficient Selection of Large-scale Geospatial Data on Maps | Request PDF. Available from: https://www.researchgate.net/publication/325374919_POIsam_a_System_for_Efficient_Selection_of_Large-scale_Geospatial_Data_on_Maps [accessed Aug 15 2018].

A.how to run the project locally
---install nodejs
(1)Ubuntu
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
(2)Mac
brew install node
(3)other ways: 
Download the Node.js source code or a pre-built installer for your platform.
https://nodejs.org/en/download/

---check whether npm and nodejs have been installed successfully
npm -v
node -v

---install nodejs libraries
npm install heap
npm install node-kmeans

---to run the demo system
cd Sigmod_domo_v1
npm start

---visit the offline system with browser
localhost:3000

B. system functionalities
---some details about the functionalities of the system
(1)both Twitter and RealEstate pages, you can set value/k and distance;
(2)for RealEstate, you can define your personalised attributes, and then click "apply";
(3)click 'choose baseline',to compare our method with baseline;for twitter dataset, maxsum, maxmin and disC baselines may take so long to produce the results.
(4)for twitter and realEstate, click the representative objects on the map, the detailed analysis infomation will pop up on the right. click the delete button "X" at the upper right corner, you can return to the previous page.
(5)support ISOS, zoom-in, zoom-out, panning
(6)for suburb page, some representative suburbs are selected. when you click a suburb, other suburbs represented by it will pop up. You can then click one of the highlighted suburbs to go to the house-level page of that suburb, which is just similar to the RealEstate page.

C.code
---code for object selection and interactive object selection
In the folder 'models', greedy.js includes the code for object selection of Twitter data. 
greedy_pro.js for realEstate data and greedy_suburb.js for suburb data.
spatialTree.js and readFile.js is about loading the data and making index.

You can mainly refer to greedy.js for object selection. 

D.dataset
---dataset
tweetProcessed_subset.txt is a small demo dataset for twitter selection and melbourne_vis.csv is for RealEstate demo. The suburb.csv is for suburb page.
All the three datasets are in the folder 'models'.

