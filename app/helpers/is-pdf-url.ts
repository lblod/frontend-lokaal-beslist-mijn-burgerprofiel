export default function (url: string) {
  return /^(https?:\/\/).*\.pdf$/.test(url);
}
