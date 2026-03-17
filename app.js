const foods = [
"라멘",
"초밥",
"카레",
"돈카츠",
"햄버거",
"우동",
"파스타",
"야키니쿠",
"타코",
"피자"
]

function recommendFood(){

const mogu = document.getElementById("mogu")
const food = foods[Math.floor(Math.random()*foods.length)]

document.getElementById("message").innerText="모구가 찾는중..."
mogu.src="images/mogu-loading.png"

setTimeout(()=>{

mogu.src="images/mogu-recommend.png"

document.getElementById("food").innerText="오늘의 추천 : "+food
document.getElementById("message").innerText="이거 먹자!"

},1500)

}
