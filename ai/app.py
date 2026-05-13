import os
import time
import uuid
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from google import genai
from google.genai import types

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['VIDEO_FOLDER'] = 'static/videos'
os.makedirs('static/uploads', exist_ok=True)
os.makedirs('static/videos', exist_ok=True)

API_KEY = "AIzaSyCCMmtAufHCZDUPEk5S6lv799uQmJ-TFN4"
GEMINI_MODEL = "gemini-3-flash-preview"
VEO_MODEL = "veo-3.1-fast-generate-preview"

client = genai.Client(api_key=API_KEY)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_video():
    if 'image' not in request.files or 'idea' not in request.form:
        return jsonify({"error": "Missing image or idea"}), 400
        
    file = request.files['image']
    idea = request.form['idea']
    
    # Get additional specs and validate allowed values for Veo 3.1 preview.
    aspect_ratio = request.form.get('aspect_ratio', '16:9')
    if aspect_ratio not in {'16:9', '9:16'}:
        aspect_ratio = '16:9'

    resolution = request.form.get('resolution', '1080p')
    if resolution not in {'720p', '1080p'}:
        resolution = '1080p'

    try:
        duration_seconds = int(request.form.get('duration', 8))
    except (ValueError, TypeError):
        duration_seconds = 8
    # Veo currently supports durationSeconds in [4, 8].
    duration_seconds = max(4, min(8, duration_seconds))

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    mime_type = file.content_type or "image/png"

    try:
        # Step 1: Use Gemini to generate a video script prompt in Mongolian
        animation_type = request.form.get('animation_type', 'product')
        
        if animation_type == 'human':
            prompt = f"""
            Idea: {idea}

            Provided image is a human character/avatar.
            Write one final Veo-ready video generation prompt in Mongolian only.

            Hard constraints:
            - The generated video must accurately animate the human face from the provided reference image. Do not change the person's identity.
            - Keep the scene photorealistic and premium ad quality.
            - Spoken language must be 100% Mongolian. No English words in the spoken lines.
            - Voice preference: warm adult female Mongolian voice (эмэгтэй хоолой, зөөлөн дулаан өнгө) or male if the subject is male.
            - Enforce precise lip-sync: mouth, jaw, and facial muscle movements must match each spoken syllable and pause naturally between phrases.
            - Include natural subtle head movements, blinking, and facial expressions conveying the emotion of the text.
            - Background should be a clean, aesthetic setting suitable for a lifestyle or beauty presentation (e.g., warm lighting, softly blurred background).
            - Add explicit Mongolian dialogue lines enclosed in quotes.
            - Include short timestamp cues for lines (example style: 0.0-1.8s, 1.8-3.6s) so speech timing and mouth animation stay synchronized.
            - Mention natural camera movement, lighting, and composition.
            - Keep it concise and production-ready.

            Output only the final Mongolian prompt text.
            """
        else:
            prompt = f"""
            Idea: {idea}

            Provided image must be treated as the exact reference product.
            Write one final Veo-ready prompt in Mongolian only.

            Hard constraints:
            - Keep the same product identity, shape, logo, label text, and package colors as the reference image.
            - Keep the scene photorealistic, premium ad quality.
            - Do not change the brand text or package typography.
            - Spoken language must be 100% Mongolian. No English words in the spoken lines.
            - Add explicit Mongolian dialogue lines enclosed in quotes.
            - Voice preference: warm adult female Mongolian voice (эмэгтэй хоолой, зөөлөн дулаан өнгө).
            - Character style (crucial): Add cute kawaii-style eyes with distinct eyelashes, small pink blush oval marks just below the eyes, a happy open smiling mouth showing a red interior, and thin green line-arms with hands gesturing outwards from the sides of the bottle.
            - If the product speaks, enforce precise lip-sync: mouth/jaw movement must match each spoken syllable and pause naturally between phrases.
            - Background & Lighting: Place the bottle on a white marble counter in a warm bathroom setting with a glowing backlight/halo effect around the bottle and warm golden bokeh lights in the background.
            - Include short timestamp cues for lines (example style: 0.0-1.8s, 1.8-3.6s) so speech timing and mouth animation stay synchronized.
            - Composition lock: product occupies about one-third of frame area, remaining two-thirds is visible background.
            - Keep camera far enough to preserve full package silhouette and readable label.
            - Place the kawaii face (eyes and mouth) in the empty green space directly below the 'CALIFORNIA NATURALS' text and above the circular sticker.
            - Keep eyes and mouth small and subtle: each eye about 2-3% of frame width, mouth about 4-6% of frame width.
            - The exact text "CALIFORNIA NATURALS" must stay fully visible and unobstructed.
            - Mention natural camera movement, lighting, and composition.
            - Keep it concise and production-ready.

            Output only the final Mongolian prompt text.
            """
        
        with open(filepath, "rb") as f:
            image_bytes = f.read()

        response = None
        gemini_candidates = [GEMINI_MODEL]
        for current_model in gemini_candidates:
            print(f"Calling {current_model} for generating script...")
            for attempt in range(1, 4):
                try:
                    response = client.models.generate_content(
                        model=current_model,
                        contents=[
                            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                            prompt
                        ]
                    )
                    break
                except Exception as req_error:
                    err_text = str(req_error)
                    is_retryable = "UNAVAILABLE" in err_text or "503" in err_text
                    if is_retryable and attempt < 3:
                        backoff_seconds = 2 ** attempt
                        print(
                            f"{current_model} overloaded (attempt {attempt}/3). "
                            f"Retrying in {backoff_seconds}s..."
                        )
                        time.sleep(backoff_seconds)
                        continue
                    if is_retryable:
                        print(f"{current_model} unavailable. Trying fallback model...")
                        break
                    raise

            if response is not None:
                break

        if response is None:
            return jsonify({
                "error": "Gemini model is currently overloaded.",
                "hint": "Please retry in 1-2 minutes.",
                "tried_models": gemini_candidates,
            }), 503

        mongolian_script = (response.text or "").strip()
        if not mongolian_script:
            return jsonify({
                "error": "Gemini returned an empty script.",
                "hint": "Try again or provide a more detailed idea.",
            }), 502

        if animation_type == 'human':
            mongolian_script = (
                mongolian_script
                + "\n\nДуу хоолойн шаардлага: Яриа 100% монгол хэлээр байна. Зураг дээрх хүйстэй дүйцүүлж (эмэгтэй бол зөөлөн дулаан өнгөөр) ярь.\n"
                + "Дүр төрх: Өгөгдсөн зураг дээрх хүнийг амьдруулж, уруулын хөдөлгөөнийг тексттэй яг тааруулан (lip-sync) хөдөлгө. "
                + "Нүүрний хувирал, нүдээ цавчих зэрэг байгалийн хөдөлгөөн оруулна. Хүний царайг өөрчлөхгүй.\n"
                + "Ярианы мөр бүрт богино хугацааны тэмдэглэгээ (жишээ: 0.0-1.8с) оруулж амны хөдөлгөөнийг түүгээр баримжаалуул.\n"
                + "Орчин: Гоо сайхан, цэвэр тунгалаг байдлыг илтгэсэн дулаан дулаан гэрэлтүүлэгтэй, арын фон нь бага зэрэг бүдгэрсэн (bokeh) байх."
            )
        else:
            mongolian_script = (
                mongolian_script
                + "\n\nДуу хоолойн шаардлага: Яриа 100% монгол хэлээр байна. "
                + "Эмэгтэй, зөөлөн дулаан өнгөтэй дуугаар ярь. "
                + "Дүр төрх: Өхөөрдөм kawaii хэв маягийн сормуустай нүд, нүдний доор ягаан ичих туяа (blush), "
                + "баяртайгаар инээмсэглэж буй нээлттэй ам, савны хоёр талаас гарсан нарийн ногоон гартай байх. "
                + "Ам, эрүү, уруулын хөдөлгөөн нь хэлж буй үг, үе, завсарлага бүртэй яг таарч синк хийгдсэн байна. "
                + "Ярианы мөр бүрт богино хугацааны тэмдэглэгээ (жишээ: 0.0-1.8с) оруулж амны хөдөлгөөнийг түүгээр баримжаалуул. "
                + "Орчин: Савны эргэн тойронд гэрэлтсэн хүрээ (halo/backlight) үүсгэж, ард талд нь бүдэг дулаан шар гэрлүүд (bokeh) "
                + "гялалзсан, цагаан гантиг тавцан бүхий дулаан угаалгын өрөөний орчинд байрлуул. "
                + "Кадрт бүтээгдэхүүн 1/3 хэсгийг эзэлж, үлдсэн 2/3 нь орчны дэвсгэр байна. "
                + "Нүүрийг (нүд, ам) CALIFORNIA NATURALS бичгийн яг доорх ногоон сул зайд, дугуй логоны дээр байрлуулна. "
                + "Нүд бүр жижиг (кадрын өргөний 2-3%), ам жижиг (4-6%) байна. "
                + "CALIFORNIA NATURALS болон бусад хэвлэмэл бичвэр дээр давхцуулж болохгүй."
            )
        
        print(f"Generated Script (Mongolian): {mongolian_script}")

        # Step 2: Call Veo with retries and model fallback for temporary overload.
        reference_image = types.Image.from_file(location=filepath, mime_type=mime_type)
        video_op = None
        model_candidates = [VEO_MODEL]
        for current_model in model_candidates:
            print(f"Calling {current_model} endpoint via google-genai SDK...")
            for attempt in range(1, 4):
                try:
                    video_op = client.models.generate_videos(
                        model=current_model,
                        prompt=mongolian_script,
                        image=reference_image,
                        config=types.GenerateVideosConfig(
                            aspect_ratio=aspect_ratio,
                            resolution=resolution,
                            duration_seconds=duration_seconds,
                            negative_prompt=(
                                "distorted label typography, rewritten label text, translated packaging text, "
                                "invented letters, gibberish letters, blurred logo text, text occlusion over label, "
                                "eyes over CALIFORNIA text, mouth over CALIFORNIA text, face over brand text, "
                                "close-up crop cutting label, large facial features covering bottle, realistic human face, "
                                "glam makeup style, extra objects, unrealistic plastic skin"
                            ),
                        )
                    )
                    break
                except Exception as req_error:
                    err_text = str(req_error)
                    is_retryable = "UNAVAILABLE" in err_text or "503" in err_text
                    if is_retryable and attempt < 3:
                        backoff_seconds = 2 ** attempt
                        print(
                            f"{current_model} overloaded (attempt {attempt}/3). "
                            f"Retrying in {backoff_seconds}s..."
                        )
                        time.sleep(backoff_seconds)
                        continue
                    if is_retryable:
                        print(f"{current_model} unavailable. Trying fallback model...")
                        break
                    raise

            if video_op is not None:
                break

        if video_op is None:
            return jsonify({
                "error": "Veo model is currently overloaded.",
                "hint": "Please retry in 1-2 minutes.",
                "tried_models": model_candidates,
            }), 503
        
        print(f"Started Video Generation Job: {video_op.name}")
        
        # Step 3: Poll for Completion
        while not video_op.done:
            print("Polling video status...")
            time.sleep(15)  # Wait before polling
            for attempt in range(1, 4):
                try:
                    video_op = client.operations.get(video_op)
                    break
                except Exception as poll_error:
                    err_text = str(poll_error)
                    is_retryable = "UNAVAILABLE" in err_text or "503" in err_text
                    if is_retryable and attempt < 3:
                        backoff_seconds = 2 ** attempt
                        print(
                            f"Polling overloaded (attempt {attempt}/3). "
                            f"Retrying in {backoff_seconds}s..."
                        )
                        time.sleep(backoff_seconds)
                        continue
                    raise
            
        if video_op.error:
            return jsonify({"error": "Video generation failed", "details": video_op.error}), 500
            
        response_payload = video_op.response or video_op.result
        if not response_payload:
            return jsonify({"error": "Video generation completed but returned no response payload."}), 500

        generated_videos = response_payload.generated_videos
        
        if not generated_videos or len(generated_videos) == 0:
            return jsonify({"error": "No videos found in the response."}), 500

        first_generated_video = generated_videos[0]
        video_obj = first_generated_video.video
        if not video_obj:
            return jsonify({"error": "Video object is missing in generation response."}), 500

        video_bytes = video_obj.video_bytes
        if video_bytes is None:
            try:
                # Download through authenticated Gemini API instead of direct HTTP.
                video_bytes = client.files.download(file=first_generated_video)
            except Exception as download_error:
                video_uri = getattr(video_obj, "uri", None)
                return jsonify({
                    "error": "Failed to download generated video bytes from Gemini API.",
                    "details": str(download_error),
                    "video_uri": video_uri,
                }), 500
        
        # Step 4: Save the video file
        video_id = str(uuid.uuid4())
        video_path = os.path.join(app.config['VIDEO_FOLDER'], f"{video_id}.mp4")
        
        with open(video_path, "wb") as fh:
            fh.write(video_bytes)
            
        video_url = f"/static/videos/{video_id}.mp4"
        
        return jsonify({
            "message": "Video generated successfully!",
            "script": mongolian_script,
            "video_url": video_url
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_text = str(e)
        if "NOT_FOUND" in error_text and "models/" in error_text:
            try:
                available = [
                    getattr(m, "name", "")
                    for m in client.models.list()
                    if getattr(m, "name", "") and ("gemini" in m.name.lower() or "veo" in m.name.lower())
                ]
            except Exception:
                available = []
            return jsonify({
                "error": error_text,
                "hint": "The configured model name is not available for this API key/version.",
                "available_models": available,
            }), 400

        return jsonify({"error": error_text}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
