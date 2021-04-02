import Vue from 'vue'

Vue.filter('date', (ts: number): string => {
  const date = new Date(ts * 1000);

  const day = '0' + date.getDate();
  const month = '0' + (date.getMonth() + 1);
  const year = date.getFullYear();
  return day.substr(-2) + '.' + month.substr(-2) + '.' + year
})

Vue.filter('time', (ts: number): string => {
  const date = new Date(ts * 1000);
  const dayNow = new Date();
  const hours = date.getHours();
  const minutes = '0' + date.getMinutes();
  const seconds = '0' + date.getSeconds();

  if (dayNow.toDateString() >= date.toDateString()) {
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  } else {
    return date.toLocaleString('en-US', {day: 'numeric', month: 'short' })
  }

  // return hours + ':' + minutes.substr(-2) ;
})

Vue.filter('nl2br', (html: string): string => {
  return html.replace(/\n/g, '<br>')
})
