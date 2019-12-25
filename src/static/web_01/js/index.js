var nav = document.getElementsByClassName("nav")[0];
var nav_boxs = nav.getElementsByClassName("nav-box");
for (var i = 0; i < nav_boxs.length; i++) {
	nav_boxs[i].onmouseover = function() {
		this.className = "nav-box active";
	};
	nav_boxs[i].onmouseout = function() {
		this.className = "nav-box";
	};
}



/* 轮播图 */
var header = document.getElementsByClassName("header")[0];
var header_img = header.getElementsByTagName("img")[0];
var header_arrow_left = header.getElementsByClassName("arrow-left")[0];
var header_arrow_right = header.getElementsByClassName("arrow-right")[0];
var header_lis = header.getElementsByTagName("li");
var statusImg = 0;
var timer = setInterval(abc, 3000);
header_arrow_left.onclick = function() {
	var index = statusImg == 0 ? 4 : statusImg - 1;
	header_lis[statusImg].className = "";
	header_lis[index].className = "con-active";
	switchImg(index);
};
header_arrow_right.onclick = function() {
	var index = statusImg == 4 ? 0 : statusImg + 1;
	header_lis[statusImg].className = "";
	header_lis[index].className = "con-active";
	switchImg(index);
};
header_img.onmouseover = function() {
	if (statusImg == this.index) {
		return;
	}
	this.className = "img_active";
	clearInterval(timer);
};
header_img.onmouseout = function() {
	if (statusImg == this.index) {
		return;
	}
	this.className = "";
	timer = setInterval(abc, 3000);
};
for (var i = 0; i < header_lis.length; i++) {
	header_lis[i].index = i;
	header_lis[i].onmouseover = function() {
		if (statusImg == this.index) {
			return;
		}
		this.className = "con-li";
		clearInterval(timer);
	};
	header_lis[i].onmouseout = function() {
		if (statusImg == this.index) {
			return;
		}
		this.className = "";
		timer = setInterval(abc, 3000);
	};
	header_lis[i].onclick = function() {
		if (statusImg == this.index) {
			return;
		}
		header_lis[statusImg].className = "";
		this.className = "con-active";
		switchImg(this.index);
	};
}

function abc() {
	var index = statusImg == 4 ? 0 : statusImg + 1;
	header_lis[statusImg].className = "";
	header_lis[index].className = "con-active";
	switchImg(index);
}
function switchImg(index) {
	statusImg = index;
	header_img.src = "images/banner" + (index + 1) + ".png";
}



/* 技术*/
var center = document.getElementsByClassName("center")[0];
var center_left = center.getElementsByClassName("left")[0];
var center_left_lis = center_left.getElementsByTagName("li");
for (var i = 0; i < center_left_lis.length; i++) {
	center_left_lis[i].onmouseover = function() {
		this.className = "clear active";
	};
	center_left_lis[i].onmouseout = function() {
		this.className = "clear";
	};
}
var center_right = center.getElementsByClassName("right")[0];
var center_right_lis = center_right.getElementsByTagName("li");
for (var i = 0; i < center_right_lis.length; i++) {
	center_right_lis[i].onmouseover = function() {
		this.className = "clear active";
	};
	center_right_lis[i].onmouseout = function() {
		this.className = "clear";
	};
}
var center_both = center.getElementsByClassName("both")[0];
var center_both_top = center_both.getElementsByClassName("top")[0];
var center_both_bottom = center_both.getElementsByClassName("bottom")[0];
var center_both_bottom_lis = center_both_bottom.getElementsByTagName("li");
for (var i = 0; i < center_both_bottom_lis.length; i++) {
	center_both_bottom_lis[i].onmouseover = function() {
		this.className = "active";
	};
	center_both_bottom_lis[i].onmouseout = function() {
		this.className = "";
	};
}
var oncilk_xx = document.getElementsByClassName("nav-box")[7];
var children = center_both_top.getElementsByClassName("big-box");
var bl = true;
oncilk_xx.onclick = function() {
	if (bl) {
		var str = children[0].className + " active";
		children[0].className = str;
		bl = false;
	} else {
		var str = children[0].className;
		str = str.substring(0, str.length - 7);
		children[0].className = str;
		bl = true;
	}
};

for (var i = 0; i < children.length; i++) {
	children[i].onmouseover = function() {
		var str = this.className + " active";
		this.className = str;
		console.log(i);
	};
	children[i].onmouseout = function() {
		var str = this.className;
		str = str.substring(0, str.length - 7);
		this.className = str;
	}
}



var footer = document.getElementsByClassName("footer")[0];
var footer_up_a = footer.getElementsByTagName("a");
for (var i = 0; i < footer_up_a.length; i++) {
	footer_up_a[i].onmouseover = function() {
		this.className = "active";
	};
	footer_up_a[i].onmouseout = function() {
		this.className = "";
	}
}