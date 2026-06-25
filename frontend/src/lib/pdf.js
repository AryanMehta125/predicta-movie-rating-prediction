import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element and downloads it as a branded PDF.
 * Replaces unsupported `oklch(...)` colours with sRGB at clone-time so
 * html2canvas can rasterise the snapshot.
 */
export async function exportElementAsPdf(element, filename = "movieai-report.pdf") {
    if (!element) throw new Error("No element to export");

    const canvas = await html2canvas(element, {
        backgroundColor: "#FAF5EF",
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
            // Force-paint any modern colour functions browsers may inject.
            doc.querySelectorAll("*").forEach((el) => {
                const cs = doc.defaultView.getComputedStyle(el);
                ["color", "backgroundColor", "borderColor"].forEach((p) => {
                    const v = cs.getPropertyValue(p);
                    if (v && v.startsWith("oklch")) {
                        el.style[p] = "#ffffff";
                    }
                });
            });
        },
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");

    // Branded header band
    pdf.setFillColor(250, 245, 239);
    pdf.rect(0, 0, imgWidth, pageHeight, "F");
    pdf.setFillColor(201, 160, 92);
    pdf.rect(0, 0, imgWidth, 4, "F");

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    let heightLeft = imgHeight;
    let position = 8;

    pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
    heightLeft -= pageHeight - position;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.setFillColor(250, 245, 239);
        pdf.rect(0, 0, imgWidth, pageHeight, "F");
        pdf.setFillColor(201, 160, 92);
        pdf.rect(0, 0, imgWidth, 4, "F");
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
        heightLeft -= pageHeight;
    }

    // Footer on the last page
    pdf.setFontSize(8);
    pdf.setTextColor(107, 107, 114);
    pdf.text("MovieAI · Movie Rating Prediction · © 2026 Aryan Mehta", 10, 290);

    pdf.save(filename);
}
