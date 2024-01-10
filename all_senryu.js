"use strict";

window.addEventListener("DOMContentLoaded", function() {
	const appName = document.title;
	const mora = [
		"あ",
		"い", "いぇ",
		"う", "うぃ", "うぇ", "うぉ", "ゔ", "ゔぁ", "ゔぃ", "ゔぇ", "ゔぉ", "ゔゅ",
		"え",
		"お",
		"か", "が",
		"き", "きゃ", "きゅ", "きょ", "ぎ", "ぎゃ", "ぎゅ", "ぎょ",
		"く", "くぁ", "くぃ", "くぇ", "くぉ", "くゎ", "ぐ", "ぐぁ", "ぐゎ",
		"け", "げ",
		"こ", "ご",
		"さ", "ざ",
		"し", "しゃ", "しゅ", "しぇ", "しょ", "じ", "じゃ", "じゅ", "じぇ", "じょ",
		"す", "ず",
		"せ", "ぜ",
		"そ", "ぞ",
		"た", "だ",
		"ち", "ちゃ", "ちゅ", "ちぇ", "ちょ", "ぢ", "ぢゃ", "ぢゅ", "ぢぇ", "ぢょ",
		"つ", "つぁ", "つぃ", "つぇ", "つぉ", "づ",
		"て", "てぃ", "てゅ", "で", "でぃ", "でゅ",
		"と", "とぅ", "ど", "どぅ",
		"な",
		"に", "にゃ", "にゅ", "にょ",
		"ぬ",
		"ね",
		"の",
		"は", "ば", "ぱ",
		"ひ", "ひゃ", "ひゅ", "ひょ", "び", "びゃ", "びゅ", "びょ", "ぴ", "ぴゃ", "ぴゅ", "ぴょ",
		"ふ", "ふぁ", "ふぃ", "ふゅ", "ふぇ", "ふぉ", "ぶ", "ぷ",
		"へ", "べ", "ぺ",
		"ほ", "ぼ", "ぽ",
		"ま",
		"み", "みゃ", "みゅ", "みょ",
		"む",
		"め",
		"も",
		"や",
		"ゆ",
		"よ",
		"ら",
		"り", "りゃ", "りゅ", "りょ",
		"る",
		"れ",
		"ろ",
		"わ",
		"ゐ",
		"ゑ",
		"を",
		"ー", "っ",
		"ん",
	];
	{
		const moraListArea = document.getElementById("moraListArea");
		const details = document.createElement("details");
		const summary = document.createElement("summary");
		moraListArea.appendChild(details);
		details.appendChild(summary);
		summary.appendChild(document.createTextNode("「モーラ」一覧 (本データベースにおける定義)"));
		const ul = document.createElement("ul");
		details.appendChild(ul);
		for (let i = 0; i < mora.length; i++) {
			const li = document.createElement("li");
			ul.appendChild(li);
			li.appendChild(document.createTextNode(mora[i]));
		}
	}

	function moraKind(mora) {
		if (mora === "ー") return 1;
		if (mora === "っ") return 2;
		return 0;
	}

	function count(limit) {
		const countMemo = new Map();
		function countInternal(pos, prevMoraKind, limited) {
			if (pos > 17) return 1n;
			const key = "" + pos + " " + prevMoraKind + " " + (limited ? 1 : 0);
			if (countMemo.has(key)) return countMemo.get(key);
			const currentLimit = limit && limited && pos <= limit.length ? limit[pos - 1] : mora.length;
			let ans = 0n;
			for (let i = 0; i < mora.length && i <= currentLimit; i++) {
				const curMoraKind = moraKind(mora[i]);
				if (prevMoraKind === 1 && curMoraKind === 1) continue;
				if (prevMoraKind === 2 && curMoraKind > 0) continue;
				if ((pos === 1 || pos === 6 || pos === 13) && curMoraKind > 0) continue;
				ans += countInternal(pos + 1, curMoraKind, limited && i === currentLimit);
			}
			countMemo.set(key, ans);
			return ans;
		}
		return countInternal(1, 0, !!limit);
	}
	const senryuNum = count();
	document.getElementById("senryuCountArea").textContent = senryuNum.toString();
	document.getElementById("senryuCountArea2").textContent = senryuNum.toString();
	const senryuNumBitMask = (function() {
		let res = 1n;
		while (res < senryuNum) {
			res = res * 2n + 1n;
		}
		return res;
	})();

	const hiraganaSet = new Set();
	for (let i = 0; i < mora.length; i++) {
		const e = mora[i];
		for (let j = 0; j < e.length; j++) {
			hiraganaSet.add(e.charAt(j));
		}
	}
	function filterNonHiragana(str) {
		const strNormalized = str.normalize("NFC");
		let res = "";
		for (let i = 0; i < strNormalized.length; i++) {
			const c = strNormalized.charAt(i);
			if (hiraganaSet.has(c)) res += c;
		}
		return res;
	}

	function idToSenryu(id) {
		if (id < 1 || senryuNum < id) return null;
		// 選ぶことで種類数が id 以上になる最初の上限を選ぶ
		const select = [];
		for (let i = 0; i < 17; i++) select.push(mora.length - 1);
		for (let i = 0; i < 17; i++) {
			select[i] = 0;
			if (count(select) < id) {
				let no = 0, yes = mora.length - 1;
				while (no + 1 < yes) {
					const m = no + ((yes - no) >> 1);
					select[i] = m;
					if (count(select) >= id) yes = m; else no = m;
				}
				select[i] = yes;
			}
		}
		// 結果を結合する
		let result = "";
		for (let i = 0; i < 17; i++) {
			if (i === 5 || i === 12) result += "　";
			result += mora[select[i]];
		}
		return result;
	}

	const moraReverse = new Map();
	for (let i = 0; i < mora.length; i++) {
		moraReverse.set(mora[i], i);
	}
	function senryuToId(senryu) {
		const senryuFiltered = filterNonHiragana(senryu);
		const moraIndice = [];
		for (let i = 0; i < senryuFiltered.length; i++) {
			const key2 = senryuFiltered.substring(i, i + 2);
			if (moraReverse.has(key2)) {
				moraIndice.push(moraReverse.get(key2));
				i++;
			} else {
				const key = senryuFiltered.charAt(i);
				if (moraReverse.has(key)) {
					moraIndice.push(moraReverse.get(key));
				} else {
					return null; // 「モーラ」ではないひらがなが混ざっている
				}
			}
		}
		if (moraIndice.length !== 17) return null; // 結合された「モーラ」が17個ではない
		const id = count(moraIndice);
		const trueSenryu = filterNonHiragana(idToSenryu(id));
		if (senryuFiltered !== trueSenryu) return null; // その他の無効な文字列 (得られたIDを逆変換して一致しない)
		return id;
	}

	const senryuDisplayArea = document.getElementById("senryuDisplayArea");
	const senryuIdArea = document.getElementById("senryuIdArea");
	const senryuArea = document.getElementById("senryuArea");
	const postLink = document.getElementById("postLink");
	const prevButton = document.getElementById("prevButton");
	const nextButton = document.getElementById("nextButton");
	function showSenryu(id) {
		senryuDisplayArea.classList.add("searched");
		const senryu = id === null ? null : idToSenryu(id);
		if (senryu === null) {
			senryuDisplayArea.classList.remove("found");
			senryuIdArea.textContent = "?";
			senryuArea.textContent = "?";
			postLink.href = "#";
			prevButton.setAttribute("data-senryu-id", "");
			nextButton.setAttribute("data-senryu-id", "");
			location.hash = "";
			document.title = appName;
		} else {
			const idStr = id.toString();
			senryuDisplayArea.classList.add("found");
			senryuIdArea.textContent = idStr;
			senryuArea.textContent = senryu;
			if (id === 1n) {
				senryuDisplayArea.classList.add("first");
				prevButton.setAttribute("data-senryu-id", "");
			} else {
				senryuDisplayArea.classList.remove("first");
				prevButton.setAttribute("data-senryu-id", (id - 1n).toString());
			}
			if (id === senryuNum) {
				senryuDisplayArea.classList.add("last");
				nextButton.setAttribute("data-senryu-id", "");
			} else {
				senryuDisplayArea.classList.remove("last");
				nextButton.setAttribute("data-senryu-id", (id + 1n).toString());
			}
			location.hash = idStr;
			document.title = senryu + " - " + appName;
			const postURL = new URL("https://twitter.com/intent/tweet");
			postURL.searchParams.set("text", "No. " + idStr + "\n" + senryu + "\n");
			postURL.searchParams.set("url", location.href);
			postURL.searchParams.set("hashtags", "全川柳データベース");
			postLink.href = postURL.href;
		}
	}

	const queryArea = document.getElementById("queryArea");
	document.getElementById("searchForm").addEventListener("submit", function(event) {
		event.preventDefault();
		let senryuId = null;
		if (/^[0-9]+$/.test(queryArea.value)) {
			senryuId = BigInt(queryArea.value);
			if (senryuId < 1n || senryuNum < senryuId) senryuId = null;
		} else {
			senryuId = senryuToId(queryArea.value);
		}
		showSenryu(senryuId);
	});
	const randomButton = document.getElementById("randomButton");
	randomButton.addEventListener("click", function() {
		for (;;) {
			let rndValue = 1n;
			while (rndValue <= senryuNumBitMask) {
				rndValue = rndValue * 65536n + BigInt(~~(Math.random() * 65536));
			}
			rndValue &= senryuNumBitMask;
			if (rndValue < senryuNum) {
				showSenryu(rndValue + 1n);
				break;
			}
		}
	});
	prevButton.addEventListener("click", function() {
		const idStr = prevButton.getAttribute("data-senryu-id");
		if (/^[0-9]+$/.test(idStr)) showSenryu(BigInt(idStr));
	});
	nextButton.addEventListener("click", function() {
		const idStr = nextButton.getAttribute("data-senryu-id");
		if (/^[0-9]+$/.test(idStr)) showSenryu(BigInt(idStr));
	});
	document.addEventListener("keydown", function(event) {
		if (event.target === queryArea) return;
		if (event.key === "ArrowLeft") prevButton.click();
		if (event.key === "ArrowRight") nextButton.click();
		if (event.key === "r" || event.key === "R") randomButton.click();
	});

	function searchByHash() {
		const idStr = location.hash.substring(1);
		if (/^[0-9]+$/.test(idStr)) showSenryu(BigInt(idStr));
	}
	window.addEventListener("hashchange", searchByHash);
	searchByHash();
});
