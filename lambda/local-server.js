const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Lambda AI handler import
process.env.IMAGES_BUCKET = 'test-bucket';
process.env.GAMES_TABLE = 'test-table';
process.env.GEMINI_API_KEY = 'AIzaSyDpW7KXhCYLq-C-xTWSOKD9iKYnszEY1d8';

const { handler: aiHandler } = require('./dist/ai-handler');

const app = express();
const upload = multer({ dest: 'uploads/' });

// temp 폴더 생성 (lambda 폴더 기준)
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// AI handler endpoint - 파일 업로드
app.post('/ai/generate/file', upload.single('image'), async (req, res) => {
    try {
        console.log('🎮 파일 업로드로 AI 처리 시작...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'image file is required'
            });
        }

        console.log('📁 업로드된 파일:', req.file.path);

        // 파일 경로로 직접 AI 처리
        const { GameAIProcessor } = require('./dist/ai/game-ai-processor');
        const gameAI = new GameAIProcessor();
        const result = await gameAI.processGameRoundFromFile(req.file.path);

        // 입력 이미지 temp로 복사
        const timestamp = Date.now();
        const inputImagePath = path.join(tempDir, `input_${timestamp}.jpg`);
        const imageBuffer = fs.readFileSync(req.file.path);
        fs.writeFileSync(inputImagePath, imageBuffer);
        console.log(`📁 입력 이미지 저장: ${inputImagePath}`);

        // 업로드된 파일 정리
        fs.unlinkSync(req.file.path);

        // 생성된 이미지들이 있으면 temp 저장
        if (result.regeneratedImages) {
            result.outputImageFiles = [];
            result.outputImagePaths = [];
            
            console.log(`📊 총 ${result.regeneratedImages.length}개 이미지 생성됨`);
            
            result.regeneratedImages.forEach((image, index) => {
                if (image) {
                    const outputImagePath = path.join(tempDir, `output_${timestamp}_v${index+1}.jpg`);
                    fs.writeFileSync(outputImagePath, image, 'base64');
                    console.log(`📁 출력 이미지 ${index+1} 저장: output_${timestamp}_v${index+1}.jpg`);
                    
                    result.outputImageFiles.push(`temp/output_${timestamp}_v${index+1}.jpg`);
                    result.outputImagePaths.push(outputImagePath);
                } else {
                    console.log(`❌ 이미지 ${index+1} 생성 실패`);
                }
            });
            
            // base64 제거
            delete result.regeneratedImages;
            delete result.regeneratedImage;
        }

        // 입력 이미지 정보 추가
        result.inputImageFile = `temp/input_${timestamp}.jpg`;
        result.inputImagePath = inputImagePath;

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('파일 업로드 AI 처리 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// AI handler endpoint
app.post('/ai/generate', async (req, res) => {
    try {
        console.log('🎮 실제 Bedrock AI 처리 시작...');
        
        const { imageBase64 } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                error: 'imageBase64 is required'
            });
        }

        // 입력 이미지 temp 저장
        const timestamp = Date.now();
        const inputImagePath = path.join(tempDir, `input_${timestamp}.jpg`);
        
        // base64에서 data: 부분 제거
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        fs.writeFileSync(inputImagePath, base64Data, 'base64');
        console.log(`📁 입력 이미지 저장: ${inputImagePath}`);

        // 실제 Lambda handler 호출
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({ imageBase64 }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const result = await aiHandler(event);
        const responseBody = JSON.parse(result.body);

        // 생성된 이미지가 있으면 temp 저장
        if (responseBody.success && responseBody.data && responseBody.data.regeneratedImage) {
            const outputImagePath = path.join(tempDir, `output_${timestamp}.jpg`);
            const outputBase64 = responseBody.data.regeneratedImage.replace(/^data:image\/[a-z]+;base64,/, '');
            fs.writeFileSync(outputImagePath, outputBase64, 'base64');
            console.log(`📁 출력 이미지 저장: ${outputImagePath}`);
            
            // base64 제거하고 파일명만 리턴 (lambda/temp 기준)
            delete responseBody.data.regeneratedImage;
            responseBody.data.inputImageFile = `temp/input_${timestamp}.jpg`;
            responseBody.data.outputImageFile = `temp/output_${timestamp}.jpg`;
            responseBody.data.inputImagePath = inputImagePath;
            responseBody.data.outputImagePath = outputImagePath;
        }

        res.status(result.statusCode).json(responseBody);

    } catch (error) {
        console.error('Bedrock AI 처리 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 이미지 분석만 하는 API (Opus)
app.post('/ai/analyze/file', upload.single('image'), async (req, res) => {
    try {
        console.log('🔍 Opus로 이미지 분석만 수행...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'image file is required'
            });
        }

        console.log('📁 업로드된 파일:', req.file.path);

        // Sonnet으로 이미지 분석
        const { BedrockImageProcessor } = require('./dist/ai/bedrock-image-processor');
        const processor = new BedrockImageProcessor();
        const analysis = await processor.analyzeImageWithOpus(req.file.path);

        console.log('📊 분석 결과:', analysis);

        // 업로드된 파일 정리
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            analysis: analysis,
            message: '이미지 분석 완료'
        });

    } catch (error) {
        console.error('이미지 분석 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Temp 이미지 조회
app.get('/temp/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(tempDir, filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Temp 폴더 목록
app.get('/temp', (req, res) => {
    const files = fs.readdirSync(tempDir).map(file => ({
        name: file,
        url: `http://localhost:${PORT}/temp/${file}`,
        created: fs.statSync(path.join(tempDir, file)).birthtime
    }));
    res.json({ files });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 로컬 AI 서버 실행 중: http://localhost:${PORT}`);
    console.log(`📡 AI 엔드포인트: http://localhost:${PORT}/ai/generate`);
});
