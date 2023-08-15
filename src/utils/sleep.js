export function sleep(timer = 500){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, timer)
  }
  )
}