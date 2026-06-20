import type { AnalysisRecord } from '../types';

export type View = 'auth' | 'analyze' | 'results';

class AppState {
  view = $state<View>('auth');
  currentCase = $state<AnalysisRecord | null>(null);

  goTo(view: View) {
    this.view = view;
  }

  openCase(record: AnalysisRecord) {
    this.currentCase = record;
    this.view = 'results';
  }

  newCase() {
    this.currentCase = null;
    this.view = 'analyze';
  }
}

export const appState = new AppState();
