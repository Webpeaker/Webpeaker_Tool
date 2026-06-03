package com.example.geotaggingcamera

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy

class GeoPhotoAdapter(
    private var photos: MutableList<GeoPhoto>,
    private val onPhotoClick: (GeoPhoto, Int) -> Unit,
    private val onPhotoLongClick: (GeoPhoto, Int) -> Unit
) : RecyclerView.Adapter<GeoPhotoAdapter.PhotoViewHolder>() {

    inner class PhotoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val image: ImageView = itemView.findViewById(R.id.ivGridPhoto)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PhotoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_photo_grid, parent, false)
        return PhotoViewHolder(view)
    }

    override fun onBindViewHolder(holder: PhotoViewHolder, position: Int) {
        val photo = photos[position]
        Glide.with(holder.itemView.context)
            .load(photo.file)
            .centerCrop()
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .placeholder(R.drawable.ic_photo_placeholder)
            .into(holder.image)

        holder.itemView.setOnClickListener { onPhotoClick(photo, position) }
        holder.itemView.setOnLongClickListener {
            onPhotoLongClick(photo, position)
            true
        }
    }

    override fun getItemCount(): Int = photos.size

    fun removeAt(position: Int) {
        photos.removeAt(position)
        notifyItemRemoved(position)
        notifyItemRangeChanged(position, photos.size)
    }

    fun updatePhotos(newPhotos: List<GeoPhoto>) {
        photos.clear()
        photos.addAll(newPhotos)
        notifyDataSetChanged()
    }
}
