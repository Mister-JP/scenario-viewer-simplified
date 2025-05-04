/**
 * CARD DRAGGING INTERACTIONS
 * 
 * This module handles the drag-and-drop functionality that allows users
 * to reposition scenario cards within the workspace. It manages the
 * visual feedback during dragging and updates card positions.
 * 
 * Product Features:
 * - Click and drag cards to rearrange them
 * - Visual feedback during dragging  
 * - Smooth animation for position updates
 * - Brings dragged card to front (prevents hiding)
 */

import { $allCards, $activeDraggedCard, updateCardPosition, bringCardToFront } from '../state';

/**
 * Initializes the drag-and-drop system for all scenario cards.
 * Product Purpose: Makes cards moveable so teams can organize their workspace.
 */
export function setupDragAndDrop() {
  // Use event delegation for performance
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  
  workspace.addEventListener('pointerdown', handleWorkspaceClick);
}

/**
 * Handles clicks on the workspace to initialize card dragging.
 * Product Behavior: Only allows dragging by the handle to prevent accidental moves.
 */
function handleWorkspaceClick(event: PointerEvent) {
  const handle = (event.target as Element).closest('[data-drag-handle]');
  
  if (!handle) return; // Not clicking a drag handle
  
  const card = handle.closest('.card') as HTMLElement;
  if (!card) return;
  
  const cardId = parseInt(card.dataset.cardId || '', 10);
  if (isNaN(cardId)) return;
  
  startDraggingCard(card, cardId, event);
}

/**
 * Initiates card dragging when user clicks on a handle.
 * Product Flow: User grabs handle → card becomes moveable → follows cursor
 */
function startDraggingCard(element: HTMLElement, cardId: number, event: PointerEvent) {
  // Mark this card as actively being dragged
  $activeDraggedCard.set(cardId);
  
  // Bring card to front so it's always visible during drag
  bringCardToFront(cardId);
  
  // Store initial positions
  const startX = event.clientX;
  const startY = event.clientY;
  const cards = $allCards.get();
  const cardData = cards.find(c => c.id === cardId);
  
  if (!cardData) return;
  
  const initialX = cardData.x;
  const initialY = cardData.y;
  
  // Track mouse movement
  function handleMove(moveEvent: PointerEvent) {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;
    
    updateCardPosition(cardId, initialX + deltaX, initialY + deltaY);
  }
  
  // Stop dragging when mouse released
  function handleRelease() {
    document.removeEventListener('pointermove', handleMove);
    document.removeEventListener('pointerup', handleRelease);
    
    // Clear active drag state
    $activeDraggedCard.set(null);
  }
  
  document.addEventListener('pointermove', handleMove);
  document.addEventListener('pointerup', handleRelease);
}