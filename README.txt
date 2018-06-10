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

---some details about the functionalities of the system
(1)both Twitter and RealEstate pages, you can set value/k and distance;
(2)for RealEstate, you can define your personalised attributes, and then click "apply";
(3)click 'choose baseline',to compare our method with baseline;for twitter dataset, maxsum, maxmin and disC baselines may take so long to produce the results.
(4)for twitter and realEstate, click the representative objects on the map, the detailed analysis infomation will pop up on the right. click the delete button "X" at the upper right corner, you can return to the previous page.
(5)support ISOS, zoom-in, zoom-out, panning
(6)for suburb page, some representative suburbs are selected. when you click a suburb, other suburbs represented by it will pop up. You can then click one of the highlighted suburbs to go to the house-level page of that suburb, which is just similar to the RealEstate page.

