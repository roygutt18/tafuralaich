const items1 = document.querySelectorAll(".timeline-item");
const line = document.querySelector(".timeline-line");
const circles = document.querySelectorAll(".timeline-circle");

function updateTimeline() {
  const viewportHeight = window.innerHeight;
  const firstRect = items1[0].getBoundingClientRect();
  let maxHeight = 0;

  items1.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const reached = rect.top < viewportHeight * 0.7;

    if (reached) {
      circles[index].classList.add("filled");
      const distance = rect.bottom - firstRect.top;
      if (distance > maxHeight) maxHeight = distance;
    } else {
      circles[index].classList.remove("filled");
    }
  });

  const lastRect = items1[items1.length - 1].getBoundingClientRect();
  if (lastRect.top < viewportHeight * 0.6) {
    const distanceToLast = lastRect.bottom - firstRect.top;
    if (distanceToLast > maxHeight) maxHeight = distanceToLast;
  }

  if (firstRect.top > viewportHeight * 0.6) {
    line.style.height = "0px";
    return;
  }

  line.style.height = maxHeight + "px";
}

window.addEventListener("scroll", updateTimeline);
updateTimeline();
