

$(document).ready(() =>{
  // Open side bar
  $(".menu-btn").click(() =>{
    $(".side-bar").addClass("active");
    $(".menu-btn").css("visibility", "hidden");
  });
  // Close side bar
  $(".close-btn").click(() =>{
    $(".side-bar").removeClass("active");
    $(".menu-btn").css("visibility", "visible");
  });
});
