# reach-supplychain
A simple supply chain made in reach for the Monash hackathon.

## Usage
To run the program, you must have the installation requirements of Reach. Please learn more about reach dependencies [here](https://docs.reach.sh/tut-1.html).  
Once you have the installation requirements of Reach, run `./reach react`. This will run the program on your local device. Please be careful about which network
you work on.

## Branches
There are two branches in this project, main and compiler-issue-workaround.  

### main
If you want to see what a more fleshed out version of Reach code would look like, this branch would be it. It includes support for array containers of certain variables, like nodes, which allow for a tree graph supply chain instead of a hard-coded linear supply chain. There is no react frontend in this branch.

### compiler-issue-workaround
This was made for the Monash Hackathon to get things "working." It has a hard-coded linear supply chain that maxes out at 3 nodes and 2 edges. It does have a react frontend, that can be fitted towards a more complete main branch.

## Document
There was a document made for planning out this project. Here it is:
https://docs.google.com/document/d/1x2HNB1HFpgAvEKsl8Ke6Kh5goKW92tFx6NGtZsjMY68/edit?usp=sharing
