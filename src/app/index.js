// 页面加载完成之后执行
$(() => {
  const $player = $('#imc-music-player-js');
  const repeatType = ['list', 'random', 'single'];
  let repeatTypeIndex = 0;
  let currentMusic = model.musicList[0];
  let duration = 0;
  initMusicList();
  initPlayer();
  initBindEvent();

  function initBindEvent() {
    $('.imc-list-js').on('click', '.imc-list-item', function() {
      currentMusic = model.musicList.find(item => item.id === $(this).attr('data-id'));
      startCurrentMusic();
      $(this).addClass('active').siblings().removeClass('active');
    });
    $('.imc-music-player-box-js')
    // 暂停
      .on('click', '.imc-ctrl-pause-js', function () {
        $player.jPlayer('pause');
        $('.imc-ctrl-pause-js').addClass('dn');
        $('.imc-ctrl-play-js').removeClass('dn');
      })
      // 播放
      .on('click', '.imc-ctrl-play-js', function () {
        $player.jPlayer('play');
        $('.imc-ctrl-play-js').addClass('dn');
        $('.imc-ctrl-pause-js').removeClass('dn');
      })
      // 上一曲
      .on('click', '.imc-ctrl-prev-js', function () {
        getCurrentMusic('prev');
        startCurrentMusic();
      })
      // 下一曲
      .on('click', '.imc-ctrl-next-js', function () {
        getCurrentMusic('next');
        startCurrentMusic();
      })
      .on('click', '.imc-ctrl-repeat-js', function () {
        repeatTypeIndex = (repeatTypeIndex + 1) % 3;
        $(this).removeClass('imc-ctrl-repeat-random')
          .removeClass('imc-ctrl-repeat-list')
          .removeClass('imc-ctrl-repeat-single')
          .addClass('imc-ctrl-repeat-' + repeatType[repeatTypeIndex])
      })
      // 跳转
      .on('click', '.imc-progress-mask-js', function (event) {
        const x = event.pageX || event.clientX;
        const offset = $('.imc-progress-mask-js').offset().left;
        const progressWidth = $('.imc-progress-mask-js').width();
        const per = (x - offset) / progressWidth;
        if (duration) {
          $player.jPlayer('playHead', per * 100);
        }
      })
      .on('click', '.imc-ctrl-img-js', function () {
        $('.imc-voice-bg-js').toggleClass('dn');
      })
      .on('click', '.imc-voice-bar-mask-js', function (event) {
        const y = event.pageY || event.clientY;
        const offset = $('.imc-voice-bar-mask-js').offset();
        $('.imc-voice-bar-js').height(100 - (y - offset.top));
        $('.imc-dot-small-js').css('top', (y - offset.top));
        $player.jPlayer('volume', 1 - (y - offset.top) / 100);
      });
    // 绑定document的点击事件，当点击到非voice-bg区域时，关闭
    $(document).on('click.voice', function (event) {
      if (!$('.imc-voice-bg-js').hasClass('dn') && !(
          $(event.target).hasClass('imc-ctrl-img-js') ||
          $(event.target).hasClass('imc-voice-bg-js') ||
          $.contains($('.imc-voice-bg-js')[0], event.target)
        )) {
        $('.imc-voice-bg-js').addClass('dn');
      }
    });

    // 播放的时候运行
    $player.on($.jPlayer.event.timeupdate, function (event) {
      // console.log(event.jPlayer.status);
      duration = event.jPlayer.status.duration;
      $('.imc-time-current-js').html($.jPlayer.convertTime(event.jPlayer.status.currentTime));
      $('.imc-time-total-js').html($.jPlayer.convertTime(duration));
      $('.imc-progress-current-js').width(`${event.jPlayer.status.currentPercentAbsolute}%`);
      $('.imc-dot-big-js').css('left', `${event.jPlayer.status.currentPercentAbsolute}%`);
    });
  }

  function initPlayer() {
    $player.jPlayer({
      ready: function () {
        startCurrentMusic(true);
      },
      ended: function () {
        getCurrentMusic('next');
        startCurrentMusic();
      },
      swfPath: './node_modules/jplayer/dist/jplayer',
      supplied: 'mp3',
      wmode: 'window',
      useStateClassSkin: true,
      autoBlur: false,
      smoothPlayBar: true,
      keyEnabled: true,
      remainingDuration: true,
      toggleDuration: true,
      timeFormat: {
        showMin: true,
        showSec: true,
        sepMin: ':'
      }
    });
  }

  /**
   * 获取接下来的music
   * 点击上一曲 prev
   * 点击下一曲 next
   * @param type
   */
  function getCurrentMusic(type) {
    // 找到当前music所在的位置
    const currentIndex = model.musicList.findIndex(item => item === currentMusic);
    // 列表循环
    if (repeatTypeIndex === 0) {
      let index = 0;
      if (type === 'prev') {
        index = currentIndex ? currentIndex - 1 : model.musicList.length - 1;
      } else if (type === 'next') {
        index = currentIndex === model.musicList.length - 1 ? 0 : currentIndex + 1;
      }
      currentMusic = model.musicList[index];
    } else if (repeatTypeIndex === 1) {
      if (type === 'prev') {
        currentMusic = model.musicList[currentIndex ? currentIndex - 1 : model.musicList.length - 1];
      } else if (type === 'next') {
        let index = Math.floor(Math.random() * model.musicList.length);
        while (index === currentIndex) {
          index = Math.floor(Math.random() * model.musicList.length);
        }
        currentMusic = model.musicList[index];
      }
    }
  }

  function activateCurrent() {
    $(`.imc-list-item[data-id=${currentMusic.id}]`).addClass('active').siblings().removeClass('active');
  }

  function startCurrentMusic(isInit) {
    getCurrentMusicInfo();
    activateCurrent();
    $player.jPlayer('setMedia', {
      title: currentMusic.name,
      mp3: currentMusic.src
    });
    if (!isInit) {
      $player.jPlayer('play')
    }

  }

  function getCurrentMusicInfo() {
    $('.imc-title-text-js').html(currentMusic.name);
    $('.imc-artist-text-js').html(currentMusic.artist);
    $('.imc-music-img-js').css({
      'background-image': `url("${currentMusic.img}")`
    });
  }

  /**
   * 初始化music list
   */
  function initMusicList() {
    $('.imc-list-js').empty().html(model.musicList.map((item) => `
            <li class="imc-list-item" data-id="${item.id}">
                <div class="imc-item-name">${item.name}</div>
                <div class="imc-item-info">
${item.size} ${item.artist}${
      item.album ? ' · ' + item.album : ''
    }${
      item.description ? ' · ' + item.description : ''
    }</div>
            </li>
        `).join(''));
  }
});

