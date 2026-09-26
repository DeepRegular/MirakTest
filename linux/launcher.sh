#!/bin/sh
# Launcher for the Linux build. afterpack.ts renames the Electron binary to
# "<name>.bin" and installs this script under the original name. In
# development, MIRAKTEST_ELECTRON points it at node_modules' electron instead.
#
# Electron ships Chromium's own libffmpeg.so and links it into the global
# symbol scope. Its av_*/avcodec_* symbols are unversioned, so they also
# satisfy the LIBAVCODEC_* references in the system libVLC's avcodec plugin.
# VLC then decodes through Chromium's stripped-down FFmpeg, which has no
# MPEG-2 decoder: broadcasts play with sound but no picture ("codec not found
# (MPEG-1/2 Video)" in the VLC log). Preloading the libraries libVLC was built
# against puts them ahead of libffmpeg.so.
#
# MirakTest itself does not use Chromium's media stack (<video>, WebAudio
# decoding), which is the part that loses its own FFmpeg.

bin="$MIRAKTEST_ELECTRON"
if [ -z "$bin" ]; then
  bin="$(dirname "$(readlink -f "$0")")/$(basename "$0").bin"
fi

if [ -z "$MIRAKTEST_NO_LIBAV_PRELOAD" ]; then
  plugins="$VLC_PLUGIN_PATH"
  if [ -z "$plugins" ]; then
    for dir in \
      "/usr/lib/$(uname -m)-linux-gnu/vlc/plugins" \
      /usr/lib64/vlc/plugins \
      /usr/lib/vlc/plugins; do
      if [ -d "$dir" ]; then
        plugins="$dir"
        break
      fi
    done
  fi

  preload=""
  for plugin in \
    "$plugins/codec/libavcodec_plugin.so" \
    "$plugins/demux/libavformat_plugin.so"; do
    [ -f "$plugin" ] || continue
    for lib in $(ldd "$plugin" 2>/dev/null |
      sed -n 's/^[[:space:]]*lib\(avutil\|avcodec\|avformat\)\.so[^ ]* => \([^ ]*\) .*/\2/p'); do
      case " $preload " in
        *" $lib "*) ;;
        *) preload="$preload $lib" ;;
      esac
    done
  done

  if [ -n "$preload" ]; then
    LD_PRELOAD="${preload# }${LD_PRELOAD:+ $LD_PRELOAD}"
    export LD_PRELOAD
  fi
fi

exec "$bin" "$@"
