export default function (arr: number[]) {
  let sum = 0;
  arr.forEach((num) => sum += num);
  return sum;
};