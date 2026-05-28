import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-upload-zone',
  imports: [],
  templateUrl: './upload-zone.html',
  styleUrl: './upload-zone.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadZone {
  readonly filesSelected = output<readonly File[]>();

  protected readonly isDragging = signal(false);
  protected readonly selectedCount = signal(0);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    this.emitFiles(event.dataTransfer?.files ?? null);
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emitFiles(input.files);
    input.value = '';
  }

  protected onPaste(event: ClipboardEvent): void {
    this.emitFiles(event.clipboardData?.files ?? null);
  }

  private emitFiles(fileList: FileList | null): void {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/'));

    if (files.length === 0) {
      return;
    }

    this.selectedCount.set(files.length);
    this.filesSelected.emit(files);
  }
}
