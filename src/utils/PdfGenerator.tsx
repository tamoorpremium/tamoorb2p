// src/utils/PdfGenerator.tsx
import React from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PdfProps {
  title: string;
  sections: { title: string; content: string }[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
    color: "#b7791f", // amber-600
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#b7791f",
  },
  sectionContent: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export const PdfGenerator: React.FC<PdfProps> = ({ title, sections }) => {
  const MyDoc = () => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        {sections.map((section, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink document={<MyDoc />} fileName={`${title.replace(/\s+/g, "_")}.pdf`}>
      {({ loading }) => (loading ? "Generating PDF..." : `Download ${title} PDF`)}
    </PDFDownloadLink>
  );
};
