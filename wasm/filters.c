/**
 * Bitigey Fast Pixel & Convolution Filter Kernel (C / WebAssembly Engine)
 * Developed by Tunahan Haksever
 */

#include <stdint.h>
#include <math.h>

#define CLAMP(v) ((v) < 0 ? 0 : ((v) > 255 ? 255 : (v)))

// Adjust Brightness & Contrast in Pure C
void apply_brightness_contrast(uint8_t* pixels, int length, float brightness, float contrast) {
    for (int i = 0; i < length; i += 4) {
        // Red, Green, Blue
        for (int c = 0; c < 3; c++) {
            float val = (float)pixels[i + c];
            val = (val - 128.0f) * contrast + 128.0f + brightness;
            pixels[i + c] = (uint8_t)CLAMP(val);
        }
    }
}

// Grayscale & Sepia Tone Matrix Transformation
void apply_sepia_monochrome(uint8_t* pixels, int length, float sepia_factor, float grayscale_factor) {
    for (int i = 0; i < length; i += 4) {
        float r = (float)pixels[i];
        float g = (float)pixels[i + 1];
        float b = (float)pixels[i + 2];

        // Standard Luminance
        float gray = 0.299f * r + 0.587f * g + 0.114f * b;

        // Sepia formulas
        float sr = (r * 0.393f) + (g * 0.769f) + (b * 0.189f);
        float sg = (r * 0.349f) + (g * 0.686f) + (b * 0.168f);
        float sb = (r * 0.272f) + (g * 0.534f) + (b * 0.131f);

        // Interpolate
        float final_r = r + (gray - r) * grayscale_factor + (sr - r) * sepia_factor;
        float final_g = g + (gray - g) * grayscale_factor + (sg - g) * sepia_factor;
        float final_b = b + (gray - b) * grayscale_factor + (sb - b) * sepia_factor;

        pixels[i]     = (uint8_t)CLAMP(final_r);
        pixels[i + 1] = (uint8_t)CLAMP(final_g);
        pixels[i + 2] = (uint8_t)CLAMP(final_b);
    }
}

// 3x3 Convolution Matrix Kernel (Sharpen, Edge Detection, Gaussian Blur)
void apply_convolution_3x3(const uint8_t* src, uint8_t* dst, int width, int height, const float kernel[9], float divisor) {
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            float sum_r = 0.0f, sum_g = 0.0f, sum_b = 0.0f;
            int k_idx = 0;

            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    int p_idx = ((y + ky) * width + (x + kx)) * 4;
                    float weight = kernel[k_idx++];
                    sum_r += (float)src[p_idx] * weight;
                    sum_g += (float)src[p_idx + 1] * weight;
                    sum_b += (float)src[p_idx + 2] * weight;
                }
            }

            int out_idx = (y * width + x) * 4;
            dst[out_idx]     = (uint8_t)CLAMP(sum_r / divisor);
            dst[out_idx + 1] = (uint8_t)CLAMP(sum_g / divisor);
            dst[out_idx + 2] = (uint8_t)CLAMP(sum_b / divisor);
            dst[out_idx + 3] = src[out_idx + 3]; // Preserve alpha
        }
    }
}
