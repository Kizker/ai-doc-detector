"""
AI Document Detector — Artifact Generator Service
Generates 9 types of rich studio artifacts from uploaded documents:
1. Audio Overview (Podcast dialogue script between 2 hosts)
2. Slide Deck (Structured presentation slides)
3. Video Overview (Scene-by-scene visual storyboard & voiceover)
4. Mind Map (Hierarchical concept tree)
5. Reports (Executive briefing and deep dive document)
6. Flashcards (Q&A study cards)
7. Quiz (Interactive multiple-choice assessment)
8. Infographic (Key metrics, stats, and quotes)
9. Data Table (Structured tabular facts and comparative matrix)
"""

import re
from typing import Dict, Any, List


class ArtifactGeneratorService:
    """Intelligent document content analyzer & multi-artifact generator."""

    def __init__(self):
        pass

    def _extract_key_sentences(self, text: str, max_sentences: int = 15) -> List[str]:
        """Extract important sentences from document text."""
        raw_sentences = re.split(r"(?<=[.!?])\s+", text)
        cleaned = [s.strip() for s in raw_sentences if len(s.strip()) > 20]
        if not cleaned:
            cleaned = [text[:200]] if text else ["Dokumen tanpa konten yang terdeteksi."]
        return cleaned[:max_sentences]

    def _extract_topics_and_entities(self, text: str) -> List[str]:
        """Extract key keywords/phrases from text."""
        words = re.findall(r"\b[A-Za-zÀ-ÿ0-9_-]{4,}\b", text)
        stopwords = {
            "yang", "untuk", "pada", "dengan", "adalah", "dalam", "dari", "akan",
            "juga", "oleh", "atau", "tentang", "dapat", "bahwa", "ini", "itu",
            "this", "that", "with", "from", "have", "were", "been", "which", "their",
            "these", "those", "about", "would", "there", "could", "other", "after"
        }
        word_freq = {}
        for w in words:
            wl = w.lower()
            if wl not in stopwords and not wl.isdigit():
                word_freq[w.capitalize()] = word_freq.get(w.capitalize(), 0) + 1
        
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [w[0] for w in sorted_words[:10]] or ["Kajian Dokumen", "Analisis Utama", "Temuan Riset"]

    def generate_audio_overview(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate a 2-host podcast conversation summarizing the document."""
        sentences = self._extract_key_sentences(text, 10)
        topics = self._extract_topics_and_entities(text)
        topic_lead = ", ".join(topics[:3]) if topics else "dokumen ini"

        dialogue = [
            {
                "speaker": "Alex",
                "role": "Host Utama",
                "avatar": "🎙️",
                "text": f"Halo semuanya dan selamat datang di Audio Overview. Hari ini kita membedah sebuah dokumen menarik yang berfokus pada {topic_lead}."
            },
            {
                "speaker": "Taylor",
                "role": "Analis",
                "avatar": "💡",
                "text": f"Benar, Alex. Setelah membaca materi ini, hal pertama yang langsung menonjol adalah bagaimana penulis membingkai argumen utamanya."
            }
        ]

        # Interleave insights into conversation
        speakers = ["Alex", "Taylor"]
        for idx, sentence in enumerate(sentences[:6]):
            speaker = speakers[idx % 2]
            lead_in = [
                "Salah satu poin penting yang diangkat menyatakan bahwa",
                "Menariknya, dokumen ini menekankan bahwa",
                "Kalau kita lihat lebih mendalam, data menunjukkan",
                "Dan ini berkaitan langsung dengan kesimpulan penting:",
                "Di samping itu, dokumen juga menggarisbawahi:",
                "Poin krusial lain yang perlu dicermati:"
            ][idx % 6]

            dialogue.append({
                "speaker": speaker,
                "role": "Host Utama" if speaker == "Alex" else "Analis",
                "avatar": "🎙️" if speaker == "Alex" else "💡",
                "text": f"{lead_in} \"{sentence}\""
            })

        dialogue.append({
            "speaker": "Alex",
            "role": "Host Utama",
            "avatar": "🎙️",
            "text": "Kesimpulan yang sangat padat dan membuka wawasan. Terima kasih sudah bergabung dalam episode ringkasan dokumen kali ini!"
        })

        full_script = "\n\n".join([f"{d['speaker']} ({d['role']}): {d['text']}" for d in dialogue])
        duration_est_sec = len(full_script.split()) * 0.45

        return {
            "type": "audio_overview",
            "title": f"Audio Overview: {title}",
            "summary": f"Diskusi dua host mendalam mengkaji inti dan temuan kunci dari dokumen mengenai {topic_lead}.",
            "duration_estimate": f"{int(duration_est_sec // 60)} min {int(duration_est_sec % 60)} sec",
            "dialogue": dialogue,
            "full_script": full_script
        }

    def generate_slide_deck(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate structured presentation slides."""
        sentences = self._extract_key_sentences(text, 12)
        topics = self._extract_topics_and_entities(text)

        slides = [
            {
                "slide_number": 1,
                "title": f"Ringkasan Eksekutif: {title}",
                "subtitle": "Kajian Komprehensif & Analisis Temuan Utama",
                "bullets": [
                    f"Topik Fokus: {', '.join(topics[:4])}",
                    "Tinjauan komprehensif atas konteks, temuan, dan implikasi",
                    "Disusun secara otomatis dari dokumen yang diunggah"
                ],
                "notes": "Slide pembuka untuk memetakan ruang lingkup dokumen."
            },
            {
                "slide_number": 2,
                "title": "Latar Belakang & Konteks",
                "subtitle": "Identifikasi Masalah dan Premis Awal",
                "bullets": [
                    sentences[0] if len(sentences) > 0 else "Konteks awal telaah dokumen.",
                    sentences[1] if len(sentences) > 1 else "Fondasi pemikiran yang melatarbelakangi kajian ini."
                ],
                "notes": "Jelaskan urgensi dan latar belakang dokumen ini."
            },
            {
                "slide_number": 3,
                "title": "Temuan & Poin Kunci",
                "subtitle": "Observasi Inti yang Didokumentasikan",
                "bullets": [
                    sentences[2] if len(sentences) > 2 else "Temuan signifikan pertama.",
                    sentences[3] if len(sentences) > 3 else "Poin penguat hasil analisis.",
                    sentences[4] if len(sentences) > 4 else "Observasi empiris penting."
                ],
                "notes": "Soroti hasil analisis yang paling bernilai tinggi bagi pembaca."
            },
            {
                "slide_number": 4,
                "title": "Implikasi & Dampak Strategis",
                "subtitle": "Makna Temuan bagi Penerapan Praktis",
                "bullets": [
                    sentences[5] if len(sentences) > 5 else "Implikasi langsung terhadap bidang terkait.",
                    f"Pengaruh terhadap ekosistem {topics[0] if topics else 'kajian'}.",
                    "Peluang dan tantangan implementasi ke depan."
                ],
                "notes": "Tekankan bagaimana temuan ini memengaruhi keputusan strategis."
            },
            {
                "slide_number": 5,
                "title": "Kesimpulan & Langkah Selanjutnya",
                "subtitle": "Rekomendasi Tindak Lanjut",
                "bullets": [
                    sentences[-1] if len(sentences) > 5 else "Kesimpulan menyeluruh dari kajian.",
                    "Langkah validasi lanjutan yang direkomendasikan",
                    "Pemanfaatan wawasan untuk pengembangan berikutnya"
                ],
                "notes": "Tutup dengan ajakan bertindak atau rekomendasi konkrit."
            }
        ]

        return {
            "type": "slide_deck",
            "title": f"Slide Deck: {title}",
            "total_slides": len(slides),
            "slides": slides
        }

    def generate_video_overview(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate scene-by-scene storyboard for a video explainer."""
        sentences = self._extract_key_sentences(text, 8)
        topics = self._extract_topics_and_entities(text)

        scenes = [
            {
                "scene_number": 1,
                "timing": "00:00 - 00:15",
                "title": "Hook & Introduksi",
                "visual_prompt": f"Animasi tipografi dinamis menampilkan judul '{title}' dengan latar belakang jaringan data berdenyut halus.",
                "on_screen_text": f"EKSPLORASI: {topics[0] if topics else 'Tinjauan Materi'}",
                "voiceover": f"Apa yang sebenarnya diungkapkan dalam dokumen ini? Mari kita telusuri gagasan penting seputar {', '.join(topics[:3])}."
            },
            {
                "scene_number": 2,
                "timing": "00:15 - 00:45",
                "title": "Fokus & Landasan Utama",
                "visual_prompt": "Grafik infografis bergeser halus dari kiri ke kanan memperlihatkan diagram alur argumen.",
                "on_screen_text": "FAKTA KUNCI",
                "voiceover": sentences[0] if sentences else "Penulis menggarisbawahi landasan utama telaah ini."
            },
            {
                "scene_number": 3,
                "timing": "00:45 - 01:20",
                "title": "Analisis Mendalam & Bukti",
                "visual_prompt": "Sorotan teks dokumen bergaya editorial dengan penanda visual neon pada kalimat inti.",
                "on_screen_text": "ANALISIS MENDALAM",
                "voiceover": sentences[1] if len(sentences) > 1 else "Dokumen mengungkap korelasi data yang signifikan."
            },
            {
                "scene_number": 4,
                "timing": "01:20 - 01:50",
                "title": "Kesimpulan & Takeaway",
                "visual_prompt": "Kartu ringkasan terstruktur dengan ikon centang elegan dan ajakan aksi.",
                "on_screen_text": "KESIMPULAN AKHIR",
                "voiceover": sentences[-1] if len(sentences) > 2 else "Itulah rangkuman esensial dari dokumen yang dianalisis."
            }
        ]

        return {
            "type": "video_overview",
            "title": f"Video Storyboard: {title}",
            "estimated_duration": "01:50",
            "scenes": scenes
        }

    def generate_mind_map(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate hierarchical concept mind map tree."""
        sentences = self._extract_key_sentences(text, 10)
        topics = self._extract_topics_and_entities(text)
        main_topic = topics[0] if topics else title

        nodes = {
            "id": "root",
            "label": main_topic,
            "category": "root",
            "children": [
                {
                    "id": "c1",
                    "label": "Fondasi & Konteks",
                    "category": "foundation",
                    "children": [
                        {"id": "c1_1", "label": topics[1] if len(topics) > 1 else "Latar Belakang"},
                        {"id": "c1_2", "label": (sentences[0][:50] + "...") if sentences else "Prinsip Dasar"}
                    ]
                },
                {
                    "id": "c2",
                    "label": "Temuan & Mekanisme",
                    "category": "findings",
                    "children": [
                        {"id": "c2_1", "label": topics[2] if len(topics) > 2 else "Argumen Utama"},
                        {"id": "c2_2", "label": (sentences[1][:50] + "...") if len(sentences) > 1 else "Data Empiris"},
                        {"id": "c2_3", "label": (sentences[2][:50] + "...") if len(sentences) > 2 else "Hubungan Konsep"}
                    ]
                },
                {
                    "id": "c3",
                    "label": "Dampak & Kesimpulan",
                    "category": "impact",
                    "children": [
                        {"id": "c3_1", "label": topics[3] if len(topics) > 3 else "Penerapan Praktis"},
                        {"id": "c3_2", "label": (sentences[-1][:50] + "...") if len(sentences) > 3 else "Arah Masa Depan"}
                    ]
                }
            ]
        }

        return {
            "type": "mind_map",
            "title": f"Mind Map: {title}",
            "root": nodes
        }

    def generate_reports(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate structured executive briefing document."""
        sentences = self._extract_key_sentences(text, 15)
        topics = self._extract_topics_and_entities(text)

        exec_summary = " ".join(sentences[:3]) if len(sentences) >= 3 else text[:300]

        sections = [
            {
                "heading": "1. Ringkasan Eksekutif",
                "content": exec_summary
            },
            {
                "heading": "2. Tema Utama & Konstruk Dokumen",
                "content": f"Berdasarkan ekstraksi semantik, dokumen ini menitikberatkan pada topik: {', '.join(topics)}. Pembahasan menghubungkan aspek teoritis dan observasi faktual secara terstruktur."
            },
            {
                "heading": "3. Analisis Temuan Inti",
                "content": "\n\n".join([f"• {s}" for s in sentences[3:7]]) if len(sentences) > 3 else "Temuan dokumen tercakup dalam pembahasan utama."
            },
            {
                "heading": "4. Implikasi & Rekomendasi",
                "content": sentences[-1] if len(sentences) > 1 else "Diperlukan peninjauan lebih lanjut terhadap implementasi temuan ini."
            }
        ]

        return {
            "type": "reports",
            "title": f"Laporan Analisis Eksekutif: {title}",
            "executive_summary": exec_summary,
            "sections": sections,
            "topics": topics
        }

    def generate_flashcards(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate Q&A study cards."""
        sentences = self._extract_key_sentences(text, 12)
        topics = self._extract_topics_and_entities(text)

        cards = []
        if topics:
            cards.append({
                "id": 1,
                "front": f"Apa topik sentral yang dibahas dalam dokumen ini?",
                "back": f"Dokumen berfokus pada {', '.join(topics[:3])}, mengeksplorasi konsep dan hubungan data yang terkait.",
                "tag": "Konsep Inti"
            })

        for idx, sentence in enumerate(sentences[:5]):
            words = sentence.split()
            concept = " ".join(words[:4]) if len(words) >= 4 else "Gagasan Dokumen"
            cards.append({
                "id": len(cards) + 1,
                "front": f"Bagaimana penjelasan dokumen mengenai '{concept}'?",
                "back": sentence,
                "tag": "Temuan Riset"
            })

        if len(sentences) > 2:
            cards.append({
                "id": len(cards) + 1,
                "front": "Apa kesimpulan utama yang ditarik dalam dokumen?",
                "back": sentences[-1],
                "tag": "Kesimpulan"
            })

        return {
            "type": "flashcards",
            "title": f"Flashcards: {title}",
            "total_cards": len(cards),
            "cards": cards
        }

    def generate_quiz(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate interactive multiple choice quiz."""
        sentences = self._extract_key_sentences(text, 10)
        topics = self._extract_topics_and_entities(text)

        questions = [
            {
                "id": 1,
                "question": f"Apa fokus pembahasan utama dalam dokumen '{title}'?",
                "options": [
                    f"Kajian komprehensif mengenai {topics[0] if topics else 'topik utama'}",
                    "Sejarah komparatif seni rupa era Renaissance",
                    "Panduan instalasi perangkat keras jaringan lokal",
                    "Teori astronomi kosmologi galaksi luar"
                ],
                "correct_index": 0,
                "explanation": f"Dokumen secara konsisten menelaah topik {topics[0] if topics else 'utama'} sebagai poros diskusinya."
            }
        ]

        if len(sentences) > 1:
            questions.append({
                "id": 2,
                "question": "Berdasarkan teks dokumen, pernyataan manakah yang paling akurat?",
                "options": [
                    sentences[0][:120] if len(sentences[0]) > 10 else "Dokumen menyajikan data faktual.",
                    "Dokumen menyatakan bahwa seluruh hipotesis sebelumnya dibatalkan tanpa bukti.",
                    "Tidak ada korelasi yang ditemukan dalam dokumen yang diunggah.",
                    "Penulis menolak seluruh metodologi ilmiah konvensional."
                ],
                "correct_index": 0,
                "explanation": "Pernyataan opsi pertama diambil langsung dari isi dokumen yang diekstraksi."
            })

        if len(sentences) > 3:
            questions.append({
                "id": 3,
                "question": "Poin kunci apa yang ditekankan dalam bagian analisis dokumen?",
                "options": [
                    "Analisis data tidak relevan dengan kesimpulan.",
                    sentences[2][:120] if len(sentences[2]) > 10 else "Hasil observasi mendukung temuan utama.",
                    "Seluruh data harus diuji ulang menggunakan perangkat analog.",
                    "Penulis menganjurkan penghentian penelitian lebih lanjut."
                ],
                "correct_index": 1,
                "explanation": "Poin ini merupakan representasi dari analisis mendalam yang tercantum di dokumen."
            })

        return {
            "type": "quiz",
            "title": f"Kuis Pemahaman: {title}",
            "total_questions": len(questions),
            "questions": questions
        }

    def generate_infographic(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate visual stat points, facts, and quote highlights."""
        sentences = self._extract_key_sentences(text, 10)
        topics = self._extract_topics_and_entities(text)
        word_count = len(text.split())

        stats = [
            {
                "label": "Volume Kata",
                "value": f"{word_count:,}",
                "description": "Total kata yang dianalisis dalam dokumen"
            },
            {
                "label": "Kepadatan Konsep",
                "value": f"{len(topics)} Topik",
                "description": f"Klaster utama: {', '.join(topics[:3])}"
            },
            {
                "label": "Kedalaman Kalimat",
                "value": f"{len(sentences)} Segmen",
                "description": "Kalimat berbobot informasi tinggi"
            }
        ]

        highlights = [
            {
                "title": "Temuan Esensial",
                "content": sentences[0] if sentences else "Informasi utama dokumen."
            },
            {
                "title": "Dukungan Data",
                "content": sentences[1] if len(sentences) > 1 else "Argumen pendukung yang relevan."
            },
            {
                "title": "Kesimpulan Inti",
                "content": sentences[-1] if len(sentences) > 2 else "Intisari konklusif dari dokumen."
            }
        ]

        return {
            "type": "infographic",
            "title": f"Infografis Ringkas: {title}",
            "stats": stats,
            "highlights": highlights,
            "key_quote": sentences[0] if sentences else text[:150]
        }

    def generate_data_table(self, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Generate structured comparative data table."""
        sentences = self._extract_key_sentences(text, 10)
        topics = self._extract_topics_and_entities(text)

        columns = ["No", "Aspek / Topik", "Uraian Dokumen", "Tingkat Signifikansi"]
        rows = []

        categories = ["Konteks Awal", "Premis Utama", "Bukti & Temuan", "Implikasi", "Konklusi"]
        significances = ["Tinggi", "Sangat Tinggi", "Kritikal", "Sedang", "Tinggi"]

        for i in range(min(5, len(sentences))):
            rows.append({
                "no": i + 1,
                "aspect": topics[i] if i < len(topics) else categories[i],
                "description": sentences[i],
                "significance": significances[i]
            })

        return {
            "type": "data_table",
            "title": f"Tabel Data & Matriks Analisis: {title}",
            "columns": columns,
            "rows": rows
        }

    def generate(self, artifact_type: str, text: str, title: str = "Dokumen") -> Dict[str, Any]:
        """Route to appropriate generator method."""
        handlers = {
            "audio_overview": self.generate_audio_overview,
            "slide_deck": self.generate_slide_deck,
            "video_overview": self.generate_video_overview,
            "mind_map": self.generate_mind_map,
            "reports": self.generate_reports,
            "flashcards": self.generate_flashcards,
            "quiz": self.generate_quiz,
            "infographic": self.generate_infographic,
            "data_table": self.generate_data_table,
        }

        handler = handlers.get(artifact_type)
        if not handler:
            raise ValueError(f"Unknown artifact type: {artifact_type}. Allowed: {list(handlers.keys())}")

        return handler(text, title)
