function trigger(el: Element, eventType: string) {
	if (typeof eventType === "string" && typeof el[eventType] === "function") {
		el[eventType]();
	} else {
		const event = typeof eventType === "string" ? new Event(eventType, { bubbles: true }) : eventType;
		el.dispatchEvent(event);
	}
}

function docReady(fn) {
	// see if DOM is already available
	if (document.readyState === "complete" || document.readyState === "interactive") {
		// call on next available tick
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

const ProjectDirectory = import.meta.env.VITE_CONTENT_NAME;

const Delimiter = "----------------------------------------------------\r\n",
	KeyCode_Left = 37,
	KeyCode_Up = 38,
	KeyCode_Right = 39,
	KeyCode_Down = 40,
	MinLineNumbers = 2;

let Name = "",
	Page = 0,
	AllPages = 100,
	IsLightMode = false,
	Pages = [];

const LineNumbersBox = <div id="LineNumbers"></div>;
const TypeTextarea = (
	<textarea
		id="Input"
		spellCheck={false}
		placeholder=" "
		rows={1}
		onInput={(e) => {
			e.currentTarget.style.height = "25px";
			e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
			e.currentTarget.removeAttribute("rows");
			SetLineNumbers();
		}}
		onKeyDown={(e) => {
			e.currentTarget.spellcheck = false;
			if (e.key == "Tab") {
				// get caret position/selection
				const target = e.currentTarget as HTMLTextAreaElement;
				const start = target.selectionStart ?? 0;
				const end = target.selectionEnd ?? 0;

				const value = "" + e.currentTarget.value;

				// set textarea value to: text before caret + tab + text after caret
				e.currentTarget.value = value.substring(0, start) + "\t" + value.substring(end);

				// put caret at right position again (add one for the tab)
				target.selectionStart = target.selectionEnd = start + 1;

				// prevent the focus lose
				e.preventDefault();
			}
		}}
	></textarea>
) as HTMLTextAreaElement;

const LoadContent = async () => {
	Name = (await import(`./content/${ProjectDirectory}/name.txt?raw`)).default;
	const content = await import(`./content/${ProjectDirectory}/index.html?raw`);
	Pages = content.default.split(Delimiter);
	AllPages = Pages.length - 1;
};

const LoadPage = (page = 0) => {
	document.getElementById("MainContent").innerHTML = Pages[page] as string;
	setTimeout(() => {
		[...document.getElementsByTagName("textarea")].map((i) => trigger(i, "input"));
	}, 50);
	setTimeout(SetLineNumbers, 1);
};

const SetLineNumbers = () => {
	let count = document.body.innerHTML.match(/\r?\n\r?/g).length;
	count += TypeTextarea.value ? TypeTextarea.value.match(/\r?\n\r?/g).length : 0;
	count = Math.max(count, MinLineNumbers) + 1;
	LineNumbersBox.innerHTML = "";
	LineNumbersBox.innerText = "";
	LineNumbersBox.append(...[...Array(count).keys()].slice(1).map((i) => <p class="Line">{i}</p>));
};

document.addEventListener("keydown", (event) => {
	if (!event.ctrlKey) return;

	if (event.keyCode === KeyCode_Left) {
		if (Page <= 0) {
			Page = AllPages;
		} else Page--;
		LoadPage(Page);
	} else if (event.keyCode === KeyCode_Right) {
		if (Page >= AllPages) {
			Page = 0;
		} else Page++;
		LoadPage(Page);
	} else if (event.keyCode === KeyCode_Up) {
		IsLightMode = !IsLightMode;
		if (IsLightMode) document.body.classList.add("LightMode");
		else document.body.classList.remove("LightMode");
	}
});

docReady(async () => {
	await LoadContent();

	const PageContent = (
		<div>
			{LineNumbersBox}
			<div id="Content">
				{TypeTextarea}
				<div id="MainContent"></div>
			</div>
			<span id="Copyright" class="comment">
				// {Name}
			</span>
		</div>
	);

	document.body.append(PageContent);
	document.title = Name;
	LoadPage(0);
});
