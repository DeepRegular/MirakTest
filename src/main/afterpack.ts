import child from "child_process"
import fs from "fs"
import path from "path"
import type { LinuxPackager } from "app-builder-lib/out/linuxPackager"
import axios from "axios"
import { AfterPackContext, Arch } from "electron-builder"

const exec = async (command: string) => {
  return await new Promise((res, rej) => {
    child.exec(command, (err, std) => {
      if (err) rej(err)
      res(std)
    })
  })
}

exports.default = async (ctx: AfterPackContext) => {
  console.info(`${ctx.electronPlatformName} 用の変更を適用します`)
  let dest = "./build"
  if (ctx.electronPlatformName === "darwin") {
    const src = path.resolve("./vlc_libs/")
    dest = path.resolve(
      `./build/mac${
        ctx.arch === Arch.arm64 ? "-arm64" : ""
      }/MirakTest.app/Contents/Frameworks/`
    )

    if (!fs.existsSync(src) || !fs.existsSync(dest)) {
      console.info("ファイルが存在しません、スキップします")
      return
    }
    console.info("libVLC を Contents/Frameworks にコピーします")
    const files = (await fs.promises.readdir(src))
      .filter((name) => !name.startsWith("."))
      .map((name) => path.join(src, name))
    for (const file of files) {
      await exec(`cp -Ra ${file} ${dest}`)
    }
    dest = path.resolve(
      `./build/mac${
        ctx.arch === Arch.arm64 ? "-arm64" : ""
      }/MirakTest.app/Contents/`
    )
  } else if (ctx.electronPlatformName === "win32") {
    dest = path.resolve("./build/win-unpacked/")
  } else if (ctx.electronPlatformName === "linux") {
    // linux/launcher.sh に説明あり。Electron の libffmpeg.so が libVLC の
    // avcodec を横取りしないよう、ランチャー経由で起動させる
    console.info("起動用のラッパーを配置します")
    const executable = path.join(
      ctx.appOutDir,
      (ctx.packager as LinuxPackager).executableName
    )
    await fs.promises.rename(executable, `${executable}.bin`)
    await fs.promises.copyFile(path.resolve("./linux/launcher.sh"), executable)
    await fs.promises.chmod(executable, 0o755)
  }

  console.info("libVLC の COPYRING, COPYRING.LIB をコピーします")
  const COPYRING = await axios.get(
    "https://raw.githubusercontent.com/videolan/vlc/master/COPYING",
    { responseType: "text" }
  )
  await fs.promises.writeFile(
    path.join(dest, "./LICENSE.VLC-COPYRING.txt"),
    COPYRING.data
  )
  const COPYRING_LIB = await axios.get(
    "https://raw.githubusercontent.com/videolan/vlc/master/COPYING.LIB",
    { responseType: "text" }
  )
  await fs.promises.writeFile(
    path.join(dest, "./LICENSE.VLC-COPYRING.LIB.txt"),
    COPYRING_LIB.data
  )
  if (ctx.electronPlatformName === "darwin" && ctx.arch === Arch.arm64) {
    // aarch64のみappをcodesignしなおす
    console.info("codesignを実行します")
    await exec(
      "codesign --force --deep -s - -i - ./build/mac-arm64/MirakTest.app"
    )
  }
}
