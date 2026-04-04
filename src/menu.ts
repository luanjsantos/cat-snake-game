export type GameMode = 'endless' | 'stage';

const MODES: GameMode[] = ['endless', 'stage'];

const MODE_LABELS: Record<GameMode, string> = {
  endless: 'ENDLESS',
  stage: 'STAGE MODE',
};

const MODE_DESCRIPTIONS: Record<GameMode, string[]> = {
  endless: ['Eat forever.', 'Speed never stops increasing.', 'How long can you last?'],
  stage: ['10 hand-crafted stages.', 'Obstacles, corridors & enemies.', 'Can you reach Stage 10?'],
};

const MODE_EMOJIS: Record<GameMode, string> = {
  endless: '♾️',
  stage: '🏆',
};

export class Menu {
  private selectedIndex = 0;
  private onConfirm: (mode: GameMode) => void;

  constructor(onConfirm: (mode: GameMode) => void) {
    this.onConfirm = onConfirm;
    this.setupInput();
  }

  get selectedMode(): GameMode {
    return MODES[this.selectedIndex];
  }

  private setupInput(): void {
    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('menu-overlay');
      if (!overlay || overlay.classList.contains('hidden')) return;

      if (e.key === 'ArrowLeft') {
        this.selectedIndex = (this.selectedIndex - 1 + MODES.length) % MODES.length;
        this.render();
      } else if (e.key === 'ArrowRight') {
        this.selectedIndex = (this.selectedIndex + 1) % MODES.length;
        this.render();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.hide();
        this.onConfirm(this.selectedMode);
      }
    });

    MODES.forEach((mode, i) => {
      const card = document.getElementById(`mode-card-${mode}`)!;
      card.addEventListener('click', () => {
        if (this.selectedIndex === i) {
          // Already selected — confirm on second click
          this.hide();
          this.onConfirm(this.selectedMode);
        } else {
          this.selectedIndex = i;
          this.render();
        }
      });
    });

    document.getElementById('menu-play-btn')!.addEventListener('click', () => {
      this.hide();
      this.onConfirm(this.selectedMode);
    });
  }

  show(): void {
    const overlay = document.getElementById('menu-overlay')!;
    overlay.classList.remove('hidden');
    this.render();
  }

  hide(): void {
    const overlay = document.getElementById('menu-overlay')!;
    overlay.classList.add('hidden');
  }

  render(): void {
    MODES.forEach((mode, i) => {
      const card = document.getElementById(`mode-card-${mode}`)!;
      const isSelected = i === this.selectedIndex;
      card.classList.toggle('selected', isSelected);
    });

    const desc = document.getElementById('mode-description')!;
    const lines = MODE_DESCRIPTIONS[this.selectedMode];
    desc.innerHTML = lines.map(l => `<span>${l}</span>`).join('');

    const emoji = document.getElementById('mode-emoji')!;
    emoji.textContent = MODE_EMOJIS[this.selectedMode];

    const label = document.getElementById('mode-label')!;
    label.textContent = MODE_LABELS[this.selectedMode];
  }
}
