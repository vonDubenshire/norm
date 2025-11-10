Text file: extract_pdf_text.py
Latest content with line numbers:
1	import PyPDF2
2	
3	pdf_path = '/home/ubuntu/upload/341060525-Norm-Macdonald-Live-Jokes-Transcribed.pdf'
4	output_txt_path = 'NormMacdonald-Live-Jokes-Transcribed.txt'
5	
6	with open(pdf_path, 'rb') as pdf_file:
7	    pdf_reader = PyPDF2.PdfReader(pdf_file)
8	    text = ''
9	    for page in pdf_reader.pages:
10	        text += page.extract_text()
11	
12	with open(output_txt_path, 'w') as f:
13	    f.write(text)
14	
15	