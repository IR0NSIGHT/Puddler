export function log(mssg: string) {
  //@ts-expect-error: provided by worldpainter context
  print(mssg);
}
