const supabase = require('../../../supabase');
const logger = require('../../../logger');

/**
 * Upload Flow States:
 * - initiated
 * - metadata_collected
 * - file_uploaded
 * - intent_created
 * - submitted_on_chain
 * - confirmed
 * - failed
 */

class UploadService {
    /**
     * Start or resume an upload flow
     */
    async getOrCreateFlow(userId) {
        try {
            const { data, error } = await supabase
                .from('upload_flows')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['initiated', 'metadata_collected', 'file_uploaded', 'intent_created', 'submitted_on_chain'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) return { success: true, data };

            // Create new flow
            const { data: newFlow, error: createError } = await supabase
                .from('upload_flows')
                .insert({
                    user_id: userId,
                    status: 'initiated',
                    metadata: {},
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) throw createError;
            return { success: true, data: newFlow };
        } catch (e) {
            logger.error('UploadService.getOrCreateFlow error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async updateMetadata(flowId, metadata) {
        try {
            const { data, error } = await supabase
                .from('upload_flows')
                .update({ 
                    metadata, 
                    status: 'metadata_collected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', flowId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            logger.error('UploadService.updateMetadata error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async markFileUploaded(flowId, fileId) {
        try {
            const { data, error } = await supabase
                .from('upload_flows')
                .update({ 
                    file_id: fileId,
                    status: 'file_uploaded',
                    updated_at: new Date().toISOString()
                })
                .eq('id', flowId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            logger.error('UploadService.markFileUploaded error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async createIntent(flowId) {
        try {
            // Atomic transition to intent_created
            const { data, error } = await supabase.rpc('create_upload_intent', {
                p_flow_id: flowId
            });

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            logger.error('UploadService.createIntent error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async markSubmitted(flowId, txHash, contractAddress) {
        try {
            const { data, error } = await supabase
                .from('upload_flows')
                .update({ 
                    status: 'submitted_on_chain',
                    tx_hash: txHash,
                    contract_address: contractAddress,
                    updated_at: new Date().toISOString()
                })
                .eq('id', flowId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            logger.error('UploadService.markSubmitted error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async finalize(flowId) {
        try {
            const { data, error } = await supabase.rpc('finalize_upload', {
                p_flow_id: flowId
            });

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            logger.error('UploadService.finalize error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }
}

module.exports = new UploadService();
