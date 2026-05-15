

let gameSeq=[];
let userSeq=[];

let btns=["yellow","red","purple","green"];

let started=false;
let level =0;

let h2=document.querySelector("h2");
document.addEventListener("keypress",function()
{
   if(started==false)
   {
    console.log("Game is Started!");
    started=true;
   }
   levelUp();
});     
 function btnFlash(btn){
btn.classList.add("flash");
setTimeout(function()
{
    btn.classList.remove("flash");
},1000);
 }



function levelUp()
{ 
    userSeq=[];
    level++;
   h2.innerText=`Level ${level}`;

   //random btn choose
   let randIdx=Math.floor(Math.random()*4);
   let randColor=btns[randIdx];
   let randBtn=document.querySelector(`.${randColor}`);
//    console.log(randIdx);
//    console.log(randColor);
//    console.log(randBtn);
gameSeq.push(randColor);
   btnFlash(randBtn);
}

function checkAns(idx)
{
    // console.log("Current level:",level);
if(userSeq[idx]==gameSeq[idx])
{
    if(userSeq.length==gameSeq.length)
    {
        setTimeout(levelUp,1000);
    }
}
else
{
    h2.innerHTML=`Game Over! Your score was<b>${level}</b><br> Press any key to start.`;
    document.querySelector("body").style.backgroundColor="red";
    setTimeout(function()
{
    document.querySelector("body").style.backgroundColor="white";
},150);
    reset();
}
}


function btnPress()
{ 
    console.log(this);

    let btn=this;
    btnFlash(btn);
    
    userColor=btn.getAttribute("id");
    userSeq.push(userColor);

    checkAns(userSeq.length-1);
}

let allbtns=document.querySelectorAll(".btn");
for(btn of allbtns)
{
    btn.addEventListener("click",btnPress);
}


function reset()
{
    started=false;
    gameSeq=[];
    userSeq=[];
    level=0;
}