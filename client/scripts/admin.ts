const warningToggleButtons = document.querySelectorAll('.blah .warning button.toggle') as NodeListOf<HTMLButtonElement>;

for (const toggleButton of warningToggleButtons) {
  const targetId = toggleButton.dataset['toggle'];
  const target: HTMLElement | null = document.querySelector(`.blah .text[data-toggle='${targetId}']`);
  if (!target) continue;

  toggleButton.addEventListener('click', () => {
    target.classList.toggle('hidden');
  });
}
