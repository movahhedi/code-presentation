import $ from "jquery";
const ProjectDirectory = import.meta.env.VITE_CONTENT_NAME;

const Delimiter = "----------------------------------------------------\r\n",
	KeyCode_Left = 37,
	KeyCode_Up = 38,
	KeyCode_Right = 39,
	KeyCode_Down = 40;

let Name = "",
	Page = 0,
	AllPages = 100,
	IsLightMode = false,
	Pages = [];

const LoadContent = async () => {
	Name = (await import(`./content/${ProjectDirectory}/name.txt?raw`)).default;
	const content = await import(`./content/${ProjectDirectory}/index.html?raw`);
	Pages = content.default.split(Delimiter);
	AllPages = Pages.length - 1;
};

const LoadPage = (page = 1) => {
	$("#MainContent").html(Pages[page]);
	setTimeout(() => $("textarea").trigger("input"), 100);
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

$(async () => {
	await LoadContent();

	const PageContent = (
		<div>
			<div id="LineNumbers">
				{[...Array(14 + 1).keys()].slice(1).map((i) => (
					<p class="Line">{i}</p>
				))}
			</div>
			<div id="Content">
				<textarea
					id="Input"
					spellCheck={false}
					placeholder=" "
					rows={1}
					onInput={(e) => {
						e.currentTarget.style.height = "25px";
						e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
						e.currentTarget.removeAttribute("rows");
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
				<div id="MainContent"></div>
			</div>
			<span id="Copyright" class="comment">
				// {Name}
			</span>
		</div>
	);

	document.body.append(PageContent);
	document.title = Name;
	LoadPage(1);
});
