/**
 * @fileoverview Export service for M.A.V.E.R.I.C.K.
 * Provides functionality for exporting content to industry-standard formats.
 */

import { Injectable } from '@angular/core';
import type { GeneratedConcept, CharacterConcept, PlotOutline, VisualStyle, CharacterIntel } from '../models/marvel-concept.model.js';

/**
 * Minimal glTF 2.0 root document type used for 3-D metadata export.
 * Only the fields written by this service are declared.
 */
interface GltfDocument {
  asset: { version: string; generator: string; copyright?: string };
  extensionsUsed?: string[];
  extras?: Record<string, unknown>;
  scene?: number;
  scenes?: Array<{ name: string; nodes: number[] }>;
  nodes?: Array<{ name: string; extras?: Record<string, unknown> }>;
  materials?: Array<{
    name: string;
    pbrMetallicRoughness?: Record<string, unknown>;
    extras?: Record<string, unknown>;
  }>;
}

/**
 * Service for exporting generated content to various formats.
 * 
 * This service provides:
 * - PDF export for text content
 * - JSON/XML export for data interchange
 * - FBX metadata export for 3D pipelines
 * - CSV export for tabular data
 * 
 * @example
 * ```typescript
 * const exportService = inject(ExportService);
 * await exportService.exportToPDF(content, 'character-blueprint.pdf');
 * exportService.exportToJSON(content, 'character-data.json');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Exports content to PDF format.
   * Uses browser's print capabilities to generate PDF.
   * 
   * @param {GeneratedConcept} content - Content to export
   * @param {string} filename - Output filename
   */
  async exportToPDF(content: GeneratedConcept, filename: string = 'maverick-export.pdf'): Promise<void> {
    // Create a formatted HTML document for printing
    const htmlContent = this.generatePrintableHTML(content);
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error('Failed to create print document');
    }

    // Write content to iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Trigger print dialog
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  /**
   * Exports content to JSON format.
   * 
   * @param {any} content - Content to export
   * @param {string} filename - Output filename
   */
  exportToJSON(content: any, filename: string = 'maverick-export.json'): void {
    const jsonString = JSON.stringify(content, null, 2);
    this.downloadFile(jsonString, filename, 'application/json');
  }

  /**
   * Exports content to XML format.
   * 
   * @param {GeneratedConcept} content - Content to export
   * @param {string} filename - Output filename
   */
  exportToXML(content: GeneratedConcept, filename: string = 'maverick-export.xml'): void {
    const xmlString = this.convertToXML(content);
    this.downloadFile(xmlString, filename, 'application/xml');
  }

  /**
   * Exports character concept as FBX metadata.
   * This creates an XML metadata file compatible with FBX workflows.
   * 
   * @param {CharacterConcept} character - Character concept to export
   * @param {string} filename - Output filename
   */
  exportToFBXMetadata(character: CharacterConcept, filename: string = 'character-metadata.xml'): void {
    const fbxMetadata = this.generateFBXMetadata(character);
    this.downloadFile(fbxMetadata, filename, 'application/xml');
  }

  /**
   * Exports multiple items to CSV format.
   * 
   * @param {any[]} items - Array of items to export
   * @param {string[]} columns - Column headers
   * @param {string} filename - Output filename
   */
  exportToCSV(items: any[], columns: string[], filename: string = 'maverick-export.csv'): void {
    const csvContent = this.convertToCSV(items, columns);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Exports content to Markdown format.
   * 
   * @param {GeneratedConcept} content - Content to export
   * @param {string} filename - Output filename
   */
  exportToMarkdown(content: GeneratedConcept, filename: string = 'maverick-export.md'): void {
    const markdown = this.convertToMarkdown(content);
    this.downloadFile(markdown, filename, 'text/markdown');
  }

  // ── Advanced 3-D export formats ──────────────────────────────────────────

  /**
   * Exports a character concept as a glTF 2.0 JSON metadata file.
   *
   * The exported file is a valid glTF document containing a single node whose
   * `extras` field carries all character metadata (backstory, powers,
   * weaknesses, visual description).  Artists can import this into DCC tools
   * (Blender, Maya, etc.) and attach geometry later.
   *
   * @param {CharacterConcept} character - Character concept to export
   * @param {string} filename - Output filename (should end with .gltf)
   */
  exportToGLTF(character: CharacterConcept, filename: string = 'character-metadata.gltf'): void {
    const gltf: GltfDocument = {
      asset: {
        version: '2.0',
        generator: 'M.A.V.E.R.I.C.K. v1.0',
        copyright: `Marvel character: ${character.name}`,
      },
      extensionsUsed: ['MAVERICK_character_metadata'],
      extras: {
        maverick: {
          characterName: character.name,
          backstory: character.backstory,
          powers: character.powers,
          weaknesses: character.weaknesses,
          visualDescription: character.visualDescription,
          exportedAt: new Date().toISOString(),
        },
      },
      scene: 0,
      scenes: [{ name: character.name, nodes: [0] }],
      nodes: [
        {
          name: character.name,
          extras: {
            powers: character.powers,
            weaknesses: character.weaknesses,
          },
        },
      ],
      materials: [
        {
          name: `${character.name}_material`,
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 0.0,
            roughnessFactor: 0.5,
          },
          extras: {
            visualDescription: character.visualDescription,
          },
        },
      ],
    };

    this.downloadFile(
      JSON.stringify(gltf, null, 2),
      filename,
      'model/gltf+json'
    );
  }

  /**
   * Exports a character concept as a Wavefront OBJ / MTL metadata pair.
   *
   * The OBJ file contains a comment block with all character metadata and a
   * placeholder mesh (a single vertex at the origin) so the file is valid and
   * can be imported into any DCC tool.  The accompanying MTL file encodes
   * visual style information from the character's visual description.
   *
   * @param {CharacterConcept} character - Character concept to export
   * @param {string} basename - Base filename without extension
   */
  exportToOBJ(
    character: CharacterConcept,
    basename: string = 'character-metadata'
  ): void {
    const mtlFilename = `${basename}.mtl`;

    // ── OBJ content ──────────────────────────────────────────────────────
    const objLines: string[] = [
      `# M.A.V.E.R.I.C.K. Character Export`,
      `# Character: ${character.name}`,
      `# Exported: ${new Date().toISOString()}`,
      `#`,
      `# --- BACKSTORY ---`,
      ...character.backstory
        .split('\n')
        .map(line => `# ${line}`),
      `#`,
      `# --- POWERS ---`,
      ...character.powers.map(p => `# - ${p}`),
      `#`,
      `# --- WEAKNESSES ---`,
      ...character.weaknesses.map(w => `# - ${w}`),
      `#`,
      `# --- VISUAL DESCRIPTION ---`,
      ...character.visualDescription
        .split('\n')
        .map(line => `# ${line}`),
      `#`,
      `mtllib ${mtlFilename}`,
      ``,
      `o ${character.name.replace(/\s+/g, '_')}`,
      `v 0.000000 0.000000 0.000000`,
      `usemtl ${character.name.replace(/\s+/g, '_')}_mat`,
    ];

    // ── MTL content ──────────────────────────────────────────────────────
    const mtlLines: string[] = [
      `# M.A.V.E.R.I.C.K. Material Export`,
      `# Character: ${character.name}`,
      `#`,
      `# Visual Description: ${character.visualDescription}`,
      ``,
      `newmtl ${character.name.replace(/\s+/g, '_')}_mat`,
      `Ka 1.000 1.000 1.000`,
      `Kd 0.800 0.800 0.800`,
      `Ks 0.500 0.500 0.500`,
      `Ns 96.078431`,
      `Ni 1.000000`,
      `d 1.000000`,
      `illum 2`,
    ];

    this.downloadFile(objLines.join('\n'), `${basename}.obj`, 'model/obj');
    this.downloadFile(mtlLines.join('\n'), mtlFilename, 'model/mtl');
  }

  /**
   * Exports a visual style guide as a USD-compatible ASCII metadata file.
   *
   * Universal Scene Description (USD / USDA) is the interchange format used
   * across Disney, Pixar, and major VFX pipelines.  This export writes a
   * lightweight USDA "over" prim that carries colour-palette, aesthetic, and
   * character-design metadata without requiring a geometry payload.
   *
   * @param {VisualStyle} style - Visual style guide to export
   * @param {string} filename  - Output filename (should end with .usda)
   */
  exportToUSDA(style: VisualStyle, filename: string = 'visual-style.usda'): void {
    const safeName = style.styleName.replace(/[^a-zA-Z0-9_]/g, '_');

    const usda = [
      `#usda 1.0`,
      `(`,
      `    defaultPrim = "${safeName}"`,
      `    doc = """M.A.V.E.R.I.C.K. Visual Style Export`,
      `    Style: ${style.styleName}`,
      `    Exported: ${new Date().toISOString()}`,
      `    """`,
      `)`,
      ``,
      `over "${safeName}" (`,
      `    kind = "assembly"`,
      `)`,
      `{`,
      `    string maverick:styleName = "${this.escapeUSD(style.styleName)}"`,
      `    string maverick:aesthetic = "${this.escapeUSD(style.aesthetic)}"`,
      `    string maverick:characterDesign = "${this.escapeUSD(style.characterDesign)}"`,
      `    string maverick:colorPalette = "${this.escapeUSD(style.colorPalette)}"`,
      `    string maverick:backgroundStyle = "${this.escapeUSD(style.backgroundStyle)}"`,
      `}`,
    ].join('\n');

    this.downloadFile(usda, filename, 'text/plain');
  }

  /**
   * Generates printable HTML for PDF export.
   * 
   * @param {GeneratedConcept} content - Content to format
   * @returns {string} Formatted HTML document
   * @private
   */
  private generatePrintableHTML(content: GeneratedConcept): string {
    let bodyContent = '';

    if (content.type === 'character') {
      const char = content as CharacterConcept;
      bodyContent = `
        <h1>Character Blueprint: ${char.name}</h1>
        
        <section>
          <h2>Backstory</h2>
          <p>${char.backstory}</p>
        </section>

        <section>
          <h2>Powers & Abilities</h2>
          <ul>
            ${char.powers.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </section>

        <section>
          <h2>Weaknesses</h2>
          <ul>
            ${char.weaknesses.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </section>

        <section>
          <h2>Visual Description</h2>
          <p>${char.visualDescription}</p>
        </section>
      `;
    } else if (content.type === 'plot') {
      const plot = content as PlotOutline;
      bodyContent = `
        <h1>Episode Plot Outlines</h1>
        ${plot.outlines.map((outline, i) => `
          <section>
            <h2>Outline ${i + 1}: ${outline.title}</h2>
            <ol>
              ${outline.plotPoints.map(p => `<li>${p}</li>`).join('')}
            </ol>
          </section>
        `).join('')}
      `;
    } else if (content.type === 'style') {
      const style = content as VisualStyle;
      bodyContent = `
        <h1>Visual Style Guide: ${style.styleName}</h1>
        
        <section>
          <h2>Overall Aesthetic</h2>
          <p>${style.aesthetic}</p>
        </section>

        <section>
          <h2>Character Design</h2>
          <p>${style.characterDesign}</p>
        </section>

        <section>
          <h2>Color Palette</h2>
          <p>${style.colorPalette}</p>
        </section>

        <section>
          <h2>Background & Environment Style</h2>
          <p>${style.backgroundStyle}</p>
        </section>
      `;
    } else if (content.type === 'intel') {
      const intel = content as CharacterIntel;
      bodyContent = `
        <h1>Intelligence Briefing: ${intel.characterName.toUpperCase()}</h1>
        
        <section>
          <p><strong>Known Aliases:</strong> ${intel.aliases.join(', ')}</p>
          <p><strong>Base of Operations:</strong> ${intel.baseOfOperations}</p>
        </section>

        <section>
          <h2>Abilities Assessment</h2>
          <ul>
            ${intel.abilities.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </section>

        <section>
          <h2>Psychological Profile</h2>
          <p>${intel.psychologicalProfile}</p>
        </section>

        <section>
          <h2>Exploitable Weaknesses</h2>
          <ul>
            ${intel.weaknesses.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </section>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>M.A.V.E.R.I.C.K. Export</title>
          <style>
            @page {
              margin: 1in;
            }
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #d32f2f;
              border-bottom: 3px solid #d32f2f;
              padding-bottom: 0.5em;
              margin-top: 0;
            }
            h2 {
              color: #1976d2;
              margin-top: 1.5em;
            }
            section {
              margin-bottom: 2em;
            }
            ul, ol {
              padding-left: 2em;
            }
            li {
              margin-bottom: 0.5em;
            }
            .footer {
              margin-top: 3em;
              padding-top: 1em;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${bodyContent}
          <div class="footer">
            Generated by M.A.V.E.R.I.C.K. - Marvel AI-Vision Engine for Rapid Interactive Content Kreation
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Converts content to XML format.
   * 
   * @param {GeneratedConcept} content - Content to convert
   * @returns {string} XML string
   * @private
   */
  private convertToXML(content: GeneratedConcept): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<MarvelContent>\n';
    xml += `  <Type>${content.type}</Type>\n`;

    if (content.type === 'character') {
      const char = content as CharacterConcept;
      xml += '  <Character>\n';
      xml += `    <Name>${this.escapeXML(char.name)}</Name>\n`;
      xml += `    <Backstory>${this.escapeXML(char.backstory)}</Backstory>\n`;
      xml += '    <Powers>\n';
      char.powers.forEach(p => xml += `      <Power>${this.escapeXML(p)}</Power>\n`);
      xml += '    </Powers>\n';
      xml += '    <Weaknesses>\n';
      char.weaknesses.forEach(w => xml += `      <Weakness>${this.escapeXML(w)}</Weakness>\n`);
      xml += '    </Weaknesses>\n';
      xml += `    <VisualDescription>${this.escapeXML(char.visualDescription)}</VisualDescription>\n`;
      xml += '  </Character>\n';
    }
    // Add more content types as needed

    xml += '</MarvelContent>';
    return xml;
  }

  /**
   * Generates FBX-compatible metadata XML.
   * 
   * @param {CharacterConcept} character - Character concept
   * @returns {string} FBX metadata XML
   * @private
   */
  private generateFBXMetadata(character: CharacterConcept): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<FBXMetadata version="1.0">
  <Character>
    <Name>${this.escapeXML(character.name)}</Name>
    <Description>${this.escapeXML(character.backstory)}</Description>
    <VisualReference>${this.escapeXML(character.visualDescription)}</VisualReference>
    <Properties>
      <Powers>
        ${character.powers.map(p => `<Power>${this.escapeXML(p)}</Power>`).join('\n        ')}
      </Powers>
      <Weaknesses>
        ${character.weaknesses.map(w => `<Weakness>${this.escapeXML(w)}</Weakness>`).join('\n        ')}
      </Weaknesses>
    </Properties>
    <RigProperties>
      <!-- Add rigging metadata here -->
    </RigProperties>
    <MaterialProperties>
      <!-- Add material/texture metadata here -->
    </MaterialProperties>
  </Character>
</FBXMetadata>`;
  }

  /**
   * Converts items to CSV format.
   * 
   * @param {any[]} items - Items to convert
   * @param {string[]} columns - Column headers
   * @returns {string} CSV string
   * @private
   */
  private convertToCSV(items: any[], columns: string[]): string {
    let csv = columns.join(',') + '\n';
    
    items.forEach(item => {
      const row = columns.map(col => {
        const value = item[col] || '';
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Converts content to Markdown format.
   * 
   * @param {GeneratedConcept} content - Content to convert
   * @returns {string} Markdown string
   * @private
   */
  private convertToMarkdown(content: GeneratedConcept): string {
    let md = '# M.A.V.E.R.I.C.K. Export\n\n';

    if (content.type === 'character') {
      const char = content as CharacterConcept;
      md += `## Character Blueprint: ${char.name}\n\n`;
      md += `### Backstory\n\n${char.backstory}\n\n`;
      md += `### Powers & Abilities\n\n`;
      char.powers.forEach(p => md += `- ${p}\n`);
      md += '\n### Weaknesses\n\n';
      char.weaknesses.forEach(w => md += `- ${w}\n`);
      md += `\n### Visual Description\n\n${char.visualDescription}\n`;
    }
    // Add more content types as needed

    return md;
  }

  /**
   * Escapes special XML characters.
   * 
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @private
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Escapes backslashes and double-quotes for USD string literals.
   *
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @private
   */
  private escapeUSD(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /**
   * Downloads a file to the user's device.
   * 
   * @param {string} content - File content
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   * @private
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
