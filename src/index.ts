// src/index.ts
import { log, error, success } from './utils/logger'; // Added success
import { html, render } from 'lit-html';
import { renderApp } from './templates/app';
import { setupDragAndDrop } from './interactions/card-drag';
import { setupConnectionSystem } from './interactions/connections';
import { initializeLayoutPersistence, resetLayout } from './interactions/layout'; // Added resetLayout for completeness
import { loadDefaultCards } from './state/loading';
import { atom } from 'nanostores';


console.log('%c=== Application Starting ===', 'background: #007bff; color: white; padding: 4px; border-radius: 3px;');
console.table({
  'Timestamp': new Date().toISOString(),
  'Window Loaded': document.readyState,
  'Logger Available': typeof log === 'function',
  'Atom Available': typeof atom === 'function'
});


log('Script execution started: index.ts');

// Create a dirty flag to track state changes for rendering
const $isDirty = atom<boolean>(false);
log('Dirty flag atom created for render loop');

// No need for stateAtoms set if not used for anything other than logging in subscribe
// const stateAtoms = new Set<any>();
// log('State atoms set initialized');

// Initialize the application when DOM is ready
log('Adding DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
  log('DOMContentLoaded event fired');
  const appRoot = document.getElementById('workspace');
  
  log('Looking for workspace element (appRoot)');
  if (!appRoot) {
    error('CRITICAL: Cannot initialize application - workspace element (id="workspace") not found in DOM.', {
      documentBodyHTML: document.body.innerHTML.substring(0, 500) // Log part of body
    });
    // Optionally, display a user-friendly message on the page itself
    document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; color: red;"><h1>Application Error</h1><p>Could not initialize the Scenario Viewer. The required HTML structure is missing. (Workspace element not found)</p></div>';
    return; // Stop further execution
  }
  success('Workspace element (appRoot) found successfully', { id: appRoot.id, className: appRoot.className });

  log('Subscribing to state changes for render updates');
  subscribeToStateChanges(); // Sets up $isDirty flag on state changes
  
  log('Initializing layout persistence (localStorage)');
  initializeLayoutPersistence(); // Also subscribes to cards/connections for its own purpose
  
  // Check if layout was loaded from localStorage, otherwise load defaults
  const cardsFromStorage = localStorage.getItem('scenario-viewer-layout');
  if (!cardsFromStorage || JSON.parse(cardsFromStorage).cards.length === 0) {
    log('No existing layout in localStorage or empty cards, loading default cards.');
    loadDefaultCards();
  } else {
    log('Layout successfully loaded from localStorage, skipping default card load.');
    // State should already be set by initializeLayoutPersistence if data was valid
  }
  
  log('Performing initial application render');
  try {
    render(renderApp(), appRoot);
    success('Initial application render complete.');
  } catch (err) {
    error('Error during initial render', err);
    appRoot.innerHTML = '<p style="color:red; padding:10px;">Error during initial application render. Check console.</p>';
    return;
  }
  
  // Set up interactions AFTER initial render and DOM is populated
  log('Scheduling interaction system setup (drag & drop, connections)');
  requestAnimationFrame(() => {
    log('Executing interaction system setup (post-render)');
    try {
      setupDragAndDrop();
      setupConnectionSystem();
      success('Interaction systems (drag & drop, connections) set up.');
    } catch (err) {
        error('Error setting up interaction systems', err);
    }
  });
  
  log('Starting application render loop');
  runRenderLoop();
  success('Application initialization sequence complete.');
});

function runRenderLoop() {
  // log('Render loop initialized'); // Can be verbose
  let lastRenderTime = performance.now();

  function renderLoop(currentTime: number) {
    if ($isDirty.get()) {
      const startTime = performance.now();
      // log('Render loop: $isDirty is true, re-rendering application.');
      const appRoot = document.getElementById('workspace');
      if (appRoot) {
        try {
            render(renderApp(), appRoot);
            // log('Re-render complete.');
        } catch (err) {
            error('Error during re-render in loop', err);
        }
        $isDirty.set(false);
        // log(`Render took ${performance.now() - startTime}ms`);
      } else {
        error('CRITICAL: Lost workspace element (appRoot) during render loop. Halting loop.');
        return; // Stop the loop if workspace is gone
      }
    }
    requestAnimationFrame(renderLoop);
  }
  
  requestAnimationFrame(renderLoop);
}

function subscribeToStateChanges() {
  log('Attempting to subscribe to core state atoms for UI updates.');
  import('./state').then(stateModule => {
    success('State module imported successfully for subscriptions.');
    const { $allCards, $allConnections, $activeDraggedCard, $pendingConnection, $hostUrl } = stateModule;
    
    const atomsToWatch = {
      $allCards,
      $allConnections, 
      $activeDraggedCard,
      $pendingConnection,
      $hostUrl
    };
    
    for (const [name, atomInstance] of Object.entries(atomsToWatch)) {
      if (atomInstance && typeof atomInstance.subscribe === 'function') {
        atomInstance.subscribe((value: any) => { // Add type for value if known, or use 'unknown'/'any'
          // log(`State change detected in ${name}`, value); // Can be very verbose
          if (!$isDirty.get()) { // Set dirty only if not already set, minor optimization
            $isDirty.set(true);
          }
        });
        log(`Successfully subscribed to ${name} for $isDirty updates.`);
      } else {
        error(`Failed to subscribe to ${name}: not a valid store.`, { atomInstance });
      }
    }
    success('All core state subscriptions for $isDirty complete.');
  }).catch(err => {
    error('CRITICAL: Failed to import state module for subscriptions. UI updates will not occur.', err);
  });
}

log('End of index.ts file execution reached.');