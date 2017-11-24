/**
  * 複数の画像をアニメーション GIF のように表示するスクリプト
  * <p>
  * Image1.png, Image2.png, ... Image10.png をアニメーションさせる場合は次のように記述する。<br />
  * animateImage('Image[1-10].png')
  * </p>
  * @author attosoft <http://attosoft.info/>
  * @version 0.8.0.3
  * @see http://attosoft.info/blog/animate-image/
  * 
  * Copyright (c) 2010-2011 attosoft. All rights reserved.
  * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
  */

// アニメーション設定オブジェクト
// @note animateImage() 呼び出し前 (アニメーション開始前) に設定されている値が反映される
var Animations = {
    delay: 500, // アニメーション間隔。ミリ秒 (ms) 単位で指定する。
    repeat: -1, // アニメーションの繰り返し回数。無制限に繰り返す場合は -1 を指定する。
                // 0 の場合はアニメーションされない。(最初の画像が表示される)
    rewind: false, // アニメーション終了時に最初の画像に巻き戻すかどうか
    className: 'animation', // img 要素の class 名。undefined の場合は class 属性が付加されない。
    idPrefix: 'animateImage',
    idIndex: 1
};

// img 要素に付加する ID 文字列を生成する
// @return (重複しない) ID 文字列
function generateAnimationId() {
    var id;
    do {
        id = Animations.idPrefix + Animations.idIndex++;
    } while (document.getElementById(id)); // XXX: 集約ページでは個別のページごとに idIndex が
                                           // 別インスタンスになるため重複しない ID かチェック
    return id;
}

// アニメーションオブジェクト
function Animation(files, id, repeat, rewind) {
    this.id = id;
    this.index = 0;
    this.images = generateImages(files);
    this.repeat = this.count = repeat;
    this.rewind = rewind;
}

// 複数の画像ファイルからアニメーション画像を生成
// @return Image オブジェクトの配列
function generateImages(files) {
    var isArray = files instanceof Array;

    var startIndex, endIndex, substr;
    if (isArray) {
        startIndex = 0;
        endIndex = files.length;
    } else {
        // ファイル名の連番部分を正規表現で取得
        var result = files.match(/\[(\d+)-(\d+)\]/);
        substr = result[0];
        startIndex = result[1];
        endIndex = parseInt(result[2], 10) + 1;
    }

    var images = new Array();
    for (var i = startIndex; i < endIndex; i++) {
        var image = new Image();
        image.src = isArray ? files[i] : files.replace(substr, padZero(i, startIndex.length));
        images[images.length] = image; // XXX: IE5 (JScript 5) does not support Array.push()
    }
    return images;
}

// 指定した桁数でゼロパディングした数値 (文字列) を返す
function padZero(number, digit) {
    var str = '' + number;
    while (str.length < digit) {
        str = '0' + str;
    }
    return str;
}

/**
  * 複数の画像のアニメーションを制御するオブジェクト
  * <p>
  * animate(), stopAnimate() メソッドにより任意のタイミングでアニメーションを再生/停止/開再することができる。
  * </p>
  * @param files 画像ファイル。ファイル名の連番部分は "[x-y]" 形式で表す (x: 連番の開始番号, y: 連番の終了番号)。
  *              ゼロパディングの連番の場合は "[0x-yy]" のように指定する。任意の画像を指定する場合は配列にする。(必須)
  * @param title 画像タイトル。img@alt, img@title 属性値となる。(null および省略時は属性が付加されない)
  * @param id img 要素の ID 文字列。アニメーションごとにユニークな値を指定する。(null および省略時は自動生成される)
  * @param delay アニメーション間隔 (null および省略時は Animations.delay)
  * @param repeat アニメーションの繰り返し回数 (null および省略時は Animations.repeat)
  * @param rewind アニメーション終了時に最初の画像に巻き戻す場合は true (省略時は Animations.rewind)
  */
function ImageAnimator(files, title, id, delay, repeat, rewind) {
    id = id || generateAnimationId();
    delay = delay || Animations.delay;
    repeat = typeof repeat == 'number' ? repeat : Animations.repeat;
    rewind = typeof rewind == 'boolean' ? rewind : Animations.rewind;

    var anim = new Animation(files, id, repeat, rewind);

    // img 要素の書き込み
    var imgElem = '<img id="' + id + '" src="' + anim.images[0].src + '"';
    if (typeof title == 'string') {
        imgElem += ' alt="' + title + '" title="' + title + '"';
    }
    if (Animations.className) {
        imgElem += ' class="' + Animations.className + '"';
    }
    imgElem += ' />';
    document.write(imgElem);

    /**
      * アニメーションを再生 (開再)する
      * <p>
      * アニメーションの繰り返し回数が 0 の場合、およびアニメーションが再生中の場合は何も行われない。
      * </p>
      * @param replay 再生中であっても強制的に最初の画像から再生するかどうか
      * @note アニメーション終了後に呼び出された場合は最初の画像から再生する
      */
    this.animate = function(replay) {
        if (anim.repeat == 0) {
            return; // no animation
        } else if (replay) {
            this.stopAnimate();
            anim.index = -1;
            anim.count = anim.repeat;
        } else if (anim.intervalID) {
            return; // in animation
        } else if (anim.count == 0) {
            anim.count = anim.repeat; // replay animation
        }
        anim.intervalID = setInterval(function() { _animate(anim); }, delay);
    }

    /**
      * アニメーションを停止 (一時停止) する
      */
    this.stopAnimate = function() {
        if (!anim.intervalID) {
            return;
        }
        clearInterval(anim.intervalID);
        delete anim.intervalID;
    }
}

/**
  * 複数の画像をアニメーションさせる
  * 
  * @return ImageAnimator オブジェクト
  * @see ImageAnimator(files, title, id, delay, repeat, rewind)
  * @note アニメーションの開始タイミングを制御する必要がない場合に利用する。
  *       ImageAnimator オブジェクトを生成して animate() メソッドを呼ぶ処理に相当。
  */
function animateImage(files, title, id, delay, repeat, rewind) {
    var animator = new ImageAnimator(files, title, id, delay, repeat, rewind);
    animator.animate();
    return animator;  
}

// アニメーション画像の差し替え (img@src 属性の変更)
// @param anim Animation オブジェクト
// @note setInterval() によって繰り返し呼び出される
function _animate(anim) {
    document.getElementById(anim.id).src = anim.images[++anim.index].src;

    if (anim.index == anim.images.length - 1) {
        anim.index = -1;
        if (anim.count < 0) {
            return;
        } else {
            anim.count--;
        }
    }
    if (anim.count == 0 && (!anim.rewind || anim.index == 0)) {
        clearInterval(anim.intervalID);
        delete anim.intervalID;
    }
}

//var test1=animateImage('img/projects_index/pngani/wave/wave_[1-42].png', null, null, 60)
//function test1() { animateImage('img/projects_index/pngani/wave/wave_[1-42].png', null, null, 60); }



