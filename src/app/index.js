(() => {
  // 页面加载完成之后执行
  $(() => {
    // 初始化music list
    initMusicList();
    // 绑定事件
    initBindEvent();
  });


  /**
   * 初始化music list
   */
  function initMusicList() {
    $('.imc-list-js').empty().html(model.musicList.map((item) => `
            <li class="imc-list-item" data-id="${item.id}">
                <div class="imc-item-name">${item.name}</div>
                <div class="imc-item-info">${item.size} ${item.artist}${item.album ? ' · ' + item.album : ''}${item.description ? ' · ' + item.description : ''}</div>
            </li>
        `).join(''));
  }

  function initBindEvent() {
    $('.imc-list-js').on('click', '.imc-list-item', function () {
      const musicData = model.musicList.find(item => item.id === $(this).attr('data-id'));
      if (musicData) {
        console.log(musicData);
      }
    });
  }
})();
