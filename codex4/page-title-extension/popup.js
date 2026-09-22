// 弹出窗口一打开，就自动把当前网页的标题和链接复制到剪贴板。
async function copyCurrentTabInfo() {
  const statusElement = document.getElementById("status");

  try {
    // 取得当前窗口里正在显示的那个标签页。
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (!currentTab) {
      showError(statusElement, "没有找到当前标签页。");
      return;
    }

    // tab.title 是网页标题，tab.url 是网页链接。
    const title = currentTab.title || "";
    const url = currentTab.url || "";

    if (!title && !url) {
      showError(statusElement, "无法读取该页面，请换一个普通网页再试。");
      return;
    }

    // 复制的内容是两行：第一行标题，第二行链接。
    await copyText(title + "\n" + url);

    statusElement.textContent = "已复制";
    statusElement.className = "ok";
  } catch (error) {
    showError(statusElement, "复制失败：" + error.message);
  }
}

// 把文字写进剪贴板。先用标准方法，失败时改用浏览器兼容的老方法。
async function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      // 弹窗刚打开的瞬间偶尔会提示“文档没有获得焦点”，
      // 这种情况就往下走，用备用方法再试一次。
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const succeeded = document.execCommand("copy");
  textarea.remove();

  if (!succeeded) {
    throw new Error("浏览器拒绝了复制操作");
  }
}

function showError(statusElement, message) {
  statusElement.textContent = message;
  statusElement.className = "error";
}

copyCurrentTabInfo();
